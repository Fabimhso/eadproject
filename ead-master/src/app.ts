import express from "express";
import session from "express-session";
import path from "path";

// Routes
import home from "./routes/home";
import lib from "./routes/biblioteca";
import admin from "./routes/admin";

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "APasd7Uhysrf6yhO4LDYCHJS", resave: true, saveUninitialized: true }));

app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));

app.use(home);
app.use(admin);
app.use(lib);

app.listen(3333, () => {
  console.log("\nServidor express rodando na porta 3333\nhttp://localhost:3333/\n");
});