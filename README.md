# multi-rpc-cluster-ipc

[![NPM](https://nodei.co/npm/multi-rpc-cluster-ipc.png)](https://nodei.co/npm/multi-rpc-cluster-ipc/)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fznetstar%2Fmulti-rpc-cluster-ipc.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fznetstar%2Fmulti-rpc-cluster-ipc?ref=badge_shield)

Multi-RPC Cluster-IPC is a transport for [multi-rpc](https://github.com/znetstar/multi-rpc) that communicates over the cluster API (process.send).

The cluster master can act either as a server or client, and the cluster worker can act either as a server or client.

## Example

For examples see `example/`. Make sure you install "multi-rpc" via npm install before running the tests. Multi-RPC is a peer dependency 

## Building

Multi-RPC Cluster-IPC is written in TypeScript. To compile JavaScript run `npm run build`.

## Documentation

Documentation is available in the `docs/` folder or [online here](https://multi-rpc-cluster-ipc.docs.zacharyboyd.nyc).

To generate docs run `npm run docs`.