require("dotenv").config({ path: __dirname + "/.env" });
const App = require("./app");
const { Config } = require("./decorators/config");
const { Db } = require("./decorators/db");
const jwtService = require("./helpers/jwt-service");
const githubAPIWrapper = require("./GithubAPIWrapper/index");
const cluster = require("cluster");
const os = require("os");
const CPUS = os.cpus().length;
let workerList = [];
let sigkill = false;
class FastifyServer {
  constructor(autorestart = true) {
    this.autorestart = autorestart;
    this.me = this;
    this.removeWorkerFromListByPID.bind(this);
    this.run.bind(this);
    this.master.bind(this);
    this.worker.bind(this);
  }
  run() {
    if (cluster.isMaster) {
      this.master();
    } else {
      this.worker();
    }
  }
  master() {
    console.log("Total Number of Cores: %o", CPUS);
    console.log("Master %o is running", process.pid);

    // Fork workerList
    for (let i = 0; i < CPUS; i++) {
      const fork = cluster.fork(); //spawn multiple node command in multiple terminals
      workerList.push(fork);
    }
    process.on("SIGUSR2", function () {
      console.log("Received SIGUSR2 from system");
      console.log("There are " + workerList.length + " workers running");
      workerList.forEach(function (worker) {
        console.log("Sending STOP message to worker PID=" + worker.process.pid);
        worker.send({ cmd: "stop" });
      });
    });

    process.on("SIGINT", function () {
      sigkill = true;
      process.exit();
    });
    cluster.on("death", function (worker) {
      if (sigkill) {
        console.warn("SIGKINT received - not respawning workers");
        return;
      }
      console.log(this.name + ": worker " + worker.pid + " died.");
      // If autoRestart is true, spin up another to replace it
      if (this.autorestart) {
        console.log(this.name + ": Restarting worker thread...");
        this.removeWorkerFromListByPID(worker.pid);
        workerList.push(cluster.fork());
      }
    });
    // process is clustered on a core and process id is assigned
    cluster.on("online", (worker) => {
      console.log("Worker %o is listening", worker.process.pid);
    });

    cluster.on("exit", (worker) => {
      console.log("Worker %o died", worker.process.pid);
    });
  }
  worker() {
    (async function () {
      const config = new Config({ env: process.env });
      const db = new Db({ config });
      await db.setup();
      const app = await App({
        config,
        db,
        jwtService,
        githubAPIWrapper,
      });
      // Receive messages from the master process.
      process.on("message", function (msg) {
        if (msg.cmd && msg.cmd === "stop") {
          console.log("Received STOP signal from master");
          app.close();
          process.exit();
        }
      });
      try {
        await app.listen(config.getServerPort() || 5000);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    })();
  }
  removeWorkerFromListByPID(pid) {
    let counter = -1;
    workerList.forEach(function (worker) {
      ++counter;
      if (worker.pid === pid) {
        workerList.splice(counter, 1);
      }
    });
  }
}
module.exports = FastifyServer;
