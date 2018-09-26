const { ClusterIPCTransport } = require("../lib");
const { Client, Server } = require("multi-rpc");
const cluster = require("cluster");

(async () => {
    // Master is a server
    if (cluster.isMaster) {
        const serverTransport = new ClusterIPCTransport();
        const server = new Server(serverTransport);

        server.methods.add = (param1, param2) => {
            const res = param1 + param2;
            console.log(`master - server: ${param1} + ${param2} = ${res}`);
            return res;
        };

        await server.listen();
        
        cluster.fork();
    } else {
    // Worker is a client
        const clientTransport = new ClusterIPCTransport();
        const client = new Client(clientTransport);
        const param1 = 2;
        const param2 = 2;
        const res = await client.invoke("add", [param1, param2]);
        console.log(`worker - client: ${param1} + ${param2} = ${res}`);
        process.exit(0);
    }
})();