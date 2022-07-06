import { V1Status } from "@kubernetes/client-node";
import { Command } from "commander";
import { readFileSync, readSync } from "fs";
import { resolve } from "path";
import * as YAML from "yaml";
import {
  Item,
  parseFile,
  getRootItem,
  setupSharedKubeConfig,
  create,
} from "../api";

const program = new Command()
  .name("cli")
  .option("--api-server <string>", "k8s endpoint", "http://127.0.0.1:44771/")
  .option("--resources <string>", "YAML or TS resources to import or watch", "")
  .parse();

type Options = {
  apiServer: string;
  resources: string;
};

const { apiServer, resources } = program.opts<Options>();

const intent = (level: number, intention = "  ") => {
  return Array(level).fill(intention).join("");
};

const print = (item: Item, level = 0) => {
  console.log(`${intent(level)}- ${item.type} ${item.name}`);
  item.children?.forEach((child) => print(child, level + 1));
};

const printRoot = (item: Item, level = 0) => {
  item.children.forEach((child) => print(child, level));
};

const runItem = async (item: Item, level = 0) => {
  if (item.callback) {
    console.log(`${intent(level)}- [RUN] ${item.type} (${item.name}`)
    await item.callback();
  } else {
    console.log(`${intent(level)}- ${item.type} ${item.name}`)
  }
  if (item.children) {
    for (const child of item.children) {
      await runItem(child, level + 1);
    }
  }
}

const runRoot = async (item: Item, level = 0) => {
  item.children.forEach((child) => runItem(child, level));
};

const cwd = process.cwd();
const yamlFiles = [];
const tsFiles = [];

resources.split(",").forEach((filename) => {
  const lowercaseFilename = filename.toLocaleLowerCase();
  if (!filename) {
    return;
  } else if (
    lowercaseFilename.endsWith(".json") ||
    lowercaseFilename.endsWith(".yaml") ||
    lowercaseFilename.endsWith(".yml")
  ) {
    yamlFiles.push(filename);
  } else if (
    lowercaseFilename.endsWith(".js") ||
    lowercaseFilename.endsWith(".ts")
  ) {
    tsFiles.push(filename);
  } else {
    throw new Error(`Unsupported file extension: ${filename}`);
  }
});

// Connect to cluster

setupSharedKubeConfig(apiServer);

(async () => {
  for (const yamlFile of yamlFiles) {
    const fullFilename = resolve(cwd, yamlFile);
    console.log(`Import YAML ${yamlFile} (${fullFilename})...`);
    const yamlString = String(readFileSync(fullFilename));
    // console.log(yamlString);
    const yamls = YAML.parseAllDocuments(yamlString);
    for (const yaml of yamls) {
      // console.log(yaml.toString());
      try {
        const result = await create(yaml.toJSON());
        console.log(`- ${result.body.kind} ${result.body.metadata.name} created`);
      } catch (error) {
        if (error.body.kind === "Status") {
          console.log(
            `- Ignore error: ${(error.body as V1Status).message}`
          );
        } else {
          throw error;
        }
      }
    }
  }

  for (const tsFile of tsFiles) {
    const fullFilename = resolve(cwd, tsFile);
    console.log(`Import ${tsFile} (${fullFilename})...`);
    await parseFile(tsFile, () => import(fullFilename));
  }

  // Debug...
  printRoot(getRootItem())

  // Execute them...
  runRoot(getRootItem())

})().catch((error) => console.error(error)
);
