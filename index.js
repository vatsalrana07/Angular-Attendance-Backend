import { config } from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import express from "express";

config();
const app = express();
const url = process.env.MONGO_URL || "mongodb://localhost:27017";
const client = new MongoClient(url);
const port = process.env.PORT || 4000;
let db;
app.use(
  cors({
    origin: ["http://localhost:4200"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    db = client.db("STUDENTDB");
  } catch (error) {
    console.log("Failed to Connect to MongoDB", error);
  }
}
startServer();
app.listen(port, () =>
  console.log(`Server Running At http://localhost:${port}`)
);

app.post("/api/submit", async (req, res) => {
  try {
    const { name, attendance } = req.body;
    const collection = db.collection("studentinfo");
    const result = await collection.insertOne({ name, attendance });
    res.json({ message: "Data Saved Sucessfully!", id: result.insertedID });
  } catch (error) {
    console.log("Error", error);
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const collection = db.collection("studentinfo");
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.log("Error", error);
  }
});
app.delete("/api/delete/:id", async (req, res) => {
  try {
    const id = req.params;
    const collection = db.collection("studentinfo");
    const query = { _id: new ObjectId(id) };
    const result = await collection.deleteOne(query);
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Student not found" });
    }
  } catch (error) {
    console.log("Error:", error);
  }
});
