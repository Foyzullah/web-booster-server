const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q7rxz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Helllo! I am working");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const servicesCollection = client
    .db("webBoosterAgency")
    .collection("services");

  const teamMembersCollection = client
    .db("webBoosterAgency")
    .collection("teamMembers");

  const reviewsCollection = client.db("webBoosterAgency").collection("reviews");

  const manageRoleCollection = client
    .db("webBoosterAgency")
    .collection("siteManageRole");

  const ordersCollection = client.db("webBoosterAgency").collection("orders");

  // Add Service
  app.post("/addService", (req, res) => {
    const serviceData = req.body;
    servicesCollection
      .insertOne(serviceData)
      .then((serviceInfo) => res.send(serviceInfo));
  });

  // Add team member
  app.post("/addTeamMember", (req, res) => {
    const teamMemberData = req.body;
    teamMembersCollection
      .insertOne(teamMemberData)
      .then((result) => res.send(result));
  });

  // Add manage role
  app.post("/addManageRole", (req, res) => {
    const manageRoleData = req.body;
    manageRoleCollection
      .insertOne(manageRoleData)
      .then((result) => res.send(result));
  });

  // Add Order
  app.post("/addOrder", (req, res) => {
    const orderData = req.body;
    ordersCollection.insertOne(orderData).then((result) => res.send(result));
  });

  // Get Orders
  app.get("/orders", (req, res) => {
    const email = req.query.email;
    manageRoleCollection.find({ email: email }).toArray((err, admin) => {
      const filter = {};
      if (admin.length === 0) {
        filter.email = email;
      }
      ordersCollection.find(filter).toArray((err, documents) => {
        res.send(documents);
      });
    });
  });

  // Get team member
  app.get("/teamMembers", (req, res) => {
    teamMembersCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Get All Services
  app.get("/services", (req, res) => {
    servicesCollection.find().toArray((err, services) => {
      res.send(services);
    });
  });

  // Get service by id
  app.get("/service/:id", (req, res) => {
    servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post("/review", (req, res) => {
    const reviewData = req.body;
    reviewsCollection.insertOne(reviewData).then((result) => res.send(result));
  });

  app.get("/reviews", (req, res) => {
    reviewsCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    manageRoleCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  // Delete Service
  app.delete("/deleteService/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    servicesCollection.findOneAndDelete({ _id: id }).then((result) => {
      res.send(result);
    });
  });
});

app.listen(port, () => {
  console.log(`Web booster agency listining to http://localhost:${port}`);
});
