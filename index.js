const { Gstore } = require("gstore-node");
const { Datastore } = require("@google-cloud/datastore");

const gstore = new Gstore();

const datastore = new Datastore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  namespace: "gstore-node-pr-152-repro",
});

gstore.connect(datastore);

const createDataLoader = gstore.createDataLoader.bind(gstore);

const schema = new gstore.Schema({
  name: { type: String },
});

const model = gstore.model("SomeModel", schema);

// Note: this does not reproduce the issue yet. Further investigation required.
const attemptToTriggerIssue = async () => {
  const dataloader = createDataLoader();
  const transaction = gstore.transaction();

  await transaction
    .run()
    .then(async () => {
      console.log("Executing transaction");

      const nonExistentId = 42;
      const entity = await model.get(
        nonExistentId,
        undefined,
        undefined,
        transaction,
        {
          dataloader,
        },
      );

      console.log("entity is", entity);

      return transaction.commit();
    })
    .catch(error => {
      console.error("Transaction error", error);
      return transaction.rollback();
    });
};

attemptToTriggerIssue()
  .then(console.log)
  .catch(console.error);
