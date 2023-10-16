// load data
// create embeddings
// store embeddings in vector store
// query vector store

import seed from "@/crawl/seed";

async function main() {
  const file = Bun.file("urls.txt")
  const urls =  await (await file.text()).split("\n")
  
  // Seed the database with the Joiipetcare website
  const documents = await seed(
    urls,
    1000,
    "joiipetcare",
    {
      splittingMethod: "markdown",
      chunkSize: 256,
      chunkOverlap: 10,
    }
  );

  console.log(documents);
}

main();
