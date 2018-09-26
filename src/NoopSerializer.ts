import { Serializer, Message } from "multi-rpc";

/**
 * This serializer returns whatever object is passed to it.
 */
export default class NoopSerializer extends Serializer {
    /**
     * @ignore
     */
    public get content_type(): string { return void(0); }
    
    /**
     * This function just returns whatever was passed to it.
     * @param message 
     */
    public serialize(message: Message): string|Uint8Array {
        return <any>message;
    }

    /**
     * This function just returns whatever was passed to it.
     * @param message 
     */
    public deserialize(data: any): any {
        return super.deserialize(data);
    }
};