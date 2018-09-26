const { ClusterIPCTransport, NoopSerializer } = require("../lib");
const { Client, Server } = require("multi-rpc");
const cluster = require("cluster");

(async () => {
    // Master is a client
   if (cluster.isMaster) { 
        const worker = cluster.fork();

        worker.on('online', async () => {
            const clientTransport = new ClusterIPCTransport(new NoopSerializer(), worker);
            const client = new Client(clientTransport);

            const param1 = 2;
            const param2 = 2;
            const res = await client.invoke("add", [param1, param2]);
            console.log(`master - client: ${param1} + ${param2} = ${res}`);
            client.close();
            process.exit(0);
        });
    } else {
    // Worker is a server
        const serverTransport = new ClusterIPCTransport();
        const server = new Server(serverTransport);

        server.methods.add = (param1, param2) => {
            const res = param1 + param2;
            console.log(`worker - server: ${param1} + ${param2} = ${res}`);
            return res;
        };

        await server.listen();
    }
})();