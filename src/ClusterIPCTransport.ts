import { PersistantTransport, Message, Serializer, ClientRequest, Response, Transport } from "multi-rpc";
import * as cluster from "cluster";
import { Worker } from "cluster";
import NoopSerializer from "./NoopSerializer";

/**
 * This error is thrown if a message is sent from the cluster master and no worker was set on the transport.
 */
export class NoWorkerSet extends Error {
    constructor() {
        super("No worker has been set as a connection");
    }
}

/**
 * A transport that uses Node's cluster api for communication.
 */
export default class ClusterIPCTransport extends PersistantTransport {
    /**
     * Creates a ClusterIPCTransport object.
     * @param serializer - The serializer to use for encoding/decoding. It's recommended that NoopSerializer is used since POJOs can be passed directly between worker and master.
     * @param worker - If cluster master is the client, the worker to communicate with. 
     */
    constructor(protected serializer: Serializer = new NoopSerializer(), worker?: Worker) {
        super(serializer);

        if (worker)
            this.connection = worker;

        this.ipcClientMessageHandler = ((message: any): void => {
            this.receive(message);
        });

        this.ipcWorkerHandler = (connection: Worker): void => {
            const workerId = Transport.uniqueId();
            this.connections.set(workerId, connection);

            connection.on("exit", () => {
                this.connections.delete(workerId);
            });

            (<any>connection).transport = this;
            (<any>connection).workerId = workerId;

            connection.on("message", this.workerMessageHandler);
        };

        this.ipcServerMessageHandler = ((message: Message): void => {
            const clientRequest = new ClientRequest(Transport.uniqueId(), (resp: Response) => {
                process.send(this.serializer.serialize(resp));
            });

            this.receive(<any>message, clientRequest);
        });

        
        this.workerMessageHandler = (function (message: any) {
            const { transport, workerId } = this;

            const clientRequest = new ClientRequest(workerId, (resp: Response) => {
                this.send(transport.serializer.serialize(resp));
            });

            transport.receive(message, clientRequest);
        });
    }

    
    /**
     * Handles inbound messages for Clients. 
     * @function
     * @param {Message} message - Message to process.
     * @returns {void}
     */
    protected ipcClientMessageHandler: any;
    /**
     * Sets up listening for messages on new workers and cleaning up when the worker has exited.
     * @param {Worker} connection - Worker to process.
     * @function
     * @returns {void}
     */
    protected ipcWorkerHandler: any;
    /**
     * Handles inbound messages for Servers.
     * @function
     * @param {Message} message - Message to process.
     * @returns {void}
     */
    protected ipcServerMessageHandler: any;

    /** 
     * Handles messages from workers to master acting as a server 
     * @function
     * @param {Message} message - Message to process.
     * @returns {void}
     * */
    protected workerMessageHandler: any;
    /**
     * Map of workers connected to the RPC server.
     */
    public connections: Map<any,Worker>;
    /**
     * If the master is the client this will be the cluster worker to communicate with. If the worker is the client this will be `process`.
     */
    public connection: any; 

    /**
     * Indicates if a the "message" event listener is bound to the worker or `process`.
     */
    protected connected: boolean = false;

    /**
     * Binds the "message" event listener to start listening for messages.
     */
    public async connect(): Promise<void> {
        if (cluster.isMaster) {
            if (!this.connection)
                throw new NoWorkerSet();
        } else 
            this.connection = process;
        
        this.connected = true;
        this.connection.on("message", this.ipcClientMessageHandler);
    }

    /**
     * Sends a message to the connected worker or to the master.
     * @param message - Message to send.
     */
    public async send(message: Message): Promise<void> {
        if (!this.connected)
            await this.connect();
        
        return await super.send(message);
    }

    /**
     * Sends a message to a worker.
     * @param connection - Worker to send the message to.
     * @param message - Message to send.
     */
    public async sendConnection(connection: Worker, message: Message) {
        connection.send(this.serializer.serialize(message));
    }


    /**
     * For the cluster master, begins listening for new workers. For the worker binds "message".
     */
    async listen(): Promise<void> {
        if (cluster.isMaster) {
            this.connections = new Map<any, Worker>();
            cluster.on("online", this.ipcWorkerHandler);
        }
        else {
            process.on("message", this.ipcServerMessageHandler);
        }
    }

    /**
     * Removes the event listeners set up during eariler operations.
     */
    async close(): Promise<void> {
        if (cluster.isMaster) {
            if (this.connection) {
                this.connection.removeListener("message", this.ipcClientMessageHandler);
            }
            else {
                cluster.removeListener("online", this.ipcWorkerHandler);
                for (let connection of this.connections.values()) 
                    connection.removeListener("message", this.workerMessageHandler);
            }
        }
        else {
            if (this.connection) {
                process.removeListener("message", this.ipcClientMessageHandler);
            } else {
                process.removeListener("message", this.ipcServerMessageHandler);
            }
        }
    }
};