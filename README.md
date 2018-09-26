# multi-rpc-cluster-ipc

[![NPM](https://nodei.co/npm/multi-rpc-cluster-ipc.png)](https://nodei.co/npm/multi-rpc-cluster-ipc/)

Multi-RPC Cluster-IPC is a transport for [multi-rpc](https://github.com/znetstar/multi-rpc) that communicates over the cluster API (process.send).

The cluster master can act either as a server or client, and the cluster worker can act either as a server or client.

## Example

For examples see `example/`. Make sure you install "multi-rpc" via npm install before running the example. Multi-RPC is a peer dependency 

## Building

Multi-RPC Cluster-IPC is written in TypeScript. To compile JavaScript run `npm run build`.

## Documentation

Documentation is available in the `docs/` folder or [online here](https://multi-rpc-cluster-ipc.docs.zacharyboyd.nyc).

To generate docs run `npm run docs`.
