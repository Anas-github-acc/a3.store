import * as jspb from 'google-protobuf'



export class PutRequest extends jspb.Message {
  getKey(): string;
  setKey(value: string): PutRequest;

  getValue(): string;
  setValue(value: string): PutRequest;

  getModifiedAt(): number;
  setModifiedAt(value: number): PutRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PutRequest): PutRequest.AsObject;
  static serializeBinaryToWriter(message: PutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PutRequest;
  static deserializeBinaryFromReader(message: PutRequest, reader: jspb.BinaryReader): PutRequest;
}

export namespace PutRequest {
  export type AsObject = {
    key: string,
    value: string,
    modifiedAt: number,
  }
}

export class PutResponse extends jspb.Message {
  getOk(): boolean;
  setOk(value: boolean): PutResponse;

  getMessage(): string;
  setMessage(value: string): PutResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PutResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PutResponse): PutResponse.AsObject;
  static serializeBinaryToWriter(message: PutResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PutResponse;
  static deserializeBinaryFromReader(message: PutResponse, reader: jspb.BinaryReader): PutResponse;
}

export namespace PutResponse {
  export type AsObject = {
    ok: boolean,
    message: string,
  }
}

export class GetRequest extends jspb.Message {
  getKey(): string;
  setKey(value: string): GetRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetRequest): GetRequest.AsObject;
  static serializeBinaryToWriter(message: GetRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRequest;
  static deserializeBinaryFromReader(message: GetRequest, reader: jspb.BinaryReader): GetRequest;
}

export namespace GetRequest {
  export type AsObject = {
    key: string,
  }
}

export class GetResponse extends jspb.Message {
  getValue(): string;
  setValue(value: string): GetResponse;

  getFound(): boolean;
  setFound(value: boolean): GetResponse;

  getModifiedAt(): number;
  setModifiedAt(value: number): GetResponse;

  getOwnId(): string;
  setOwnId(value: string): GetResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetResponse): GetResponse.AsObject;
  static serializeBinaryToWriter(message: GetResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetResponse;
  static deserializeBinaryFromReader(message: GetResponse, reader: jspb.BinaryReader): GetResponse;
}

export namespace GetResponse {
  export type AsObject = {
    value: string,
    found: boolean,
    modifiedAt: number,
    ownId: string,
  }
}

export class KeyValuePair extends jspb.Message {
  getKey(): string;
  setKey(value: string): KeyValuePair;

  getValue(): string;
  setValue(value: string): KeyValuePair;

  getModifiedAt(): number;
  setModifiedAt(value: number): KeyValuePair;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValuePair.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValuePair): KeyValuePair.AsObject;
  static serializeBinaryToWriter(message: KeyValuePair, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValuePair;
  static deserializeBinaryFromReader(message: KeyValuePair, reader: jspb.BinaryReader): KeyValuePair;
}

export namespace KeyValuePair {
  export type AsObject = {
    key: string,
    value: string,
    modifiedAt: number,
  }
}

export class ChunkRequest extends jspb.Message {
  getChunkId(): number;
  setChunkId(value: number): ChunkRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChunkRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChunkRequest): ChunkRequest.AsObject;
  static serializeBinaryToWriter(message: ChunkRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChunkRequest;
  static deserializeBinaryFromReader(message: ChunkRequest, reader: jspb.BinaryReader): ChunkRequest;
}

export namespace ChunkRequest {
  export type AsObject = {
    chunkId: number,
  }
}

export class ChunkHashResponse extends jspb.Message {
  getHash(): Uint8Array | string;
  getHash_asU8(): Uint8Array;
  getHash_asB64(): string;
  setHash(value: Uint8Array | string): ChunkHashResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChunkHashResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChunkHashResponse): ChunkHashResponse.AsObject;
  static serializeBinaryToWriter(message: ChunkHashResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChunkHashResponse;
  static deserializeBinaryFromReader(message: ChunkHashResponse, reader: jspb.BinaryReader): ChunkHashResponse;
}

export namespace ChunkHashResponse {
  export type AsObject = {
    hash: Uint8Array | string,
  }
}

export class RangeRequest extends jspb.Message {
  getChunkId(): number;
  setChunkId(value: number): RangeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RangeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RangeRequest): RangeRequest.AsObject;
  static serializeBinaryToWriter(message: RangeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RangeRequest;
  static deserializeBinaryFromReader(message: RangeRequest, reader: jspb.BinaryReader): RangeRequest;
}

export namespace RangeRequest {
  export type AsObject = {
    chunkId: number,
  }
}

