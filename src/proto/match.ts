/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";
import { Timestamp } from "../google/protobuf/timestamp";

export const protobufPackage = "matches";

export enum General {
  USA = 0,
  AIR = 1,
  LASER = 2,
  SUPER = 3,
  CHINA = 4,
  NUKE = 5,
  TANK = 6,
  INFANTRY = 7,
  GLA = 8,
  TOXIN = 9,
  STEALTH = 10,
  DEMO = 11,
  UNRECOGNIZED = -1,
}

export function generalFromJSON(object: any): General {
  switch (object) {
    case 0:
    case "USA":
      return General.USA;
    case 1:
    case "AIR":
      return General.AIR;
    case 2:
    case "LASER":
      return General.LASER;
    case 3:
    case "SUPER":
      return General.SUPER;
    case 4:
    case "CHINA":
      return General.CHINA;
    case 5:
    case "NUKE":
      return General.NUKE;
    case 6:
    case "TANK":
      return General.TANK;
    case 7:
    case "INFANTRY":
      return General.INFANTRY;
    case 8:
    case "GLA":
      return General.GLA;
    case 9:
    case "TOXIN":
      return General.TOXIN;
    case 10:
    case "STEALTH":
      return General.STEALTH;
    case 11:
    case "DEMO":
      return General.DEMO;
    case -1:
    case "UNRECOGNIZED":
    default:
      return General.UNRECOGNIZED;
  }
}

export function generalToJSON(object: General): string {
  switch (object) {
    case General.USA:
      return "USA";
    case General.AIR:
      return "AIR";
    case General.LASER:
      return "LASER";
    case General.SUPER:
      return "SUPER";
    case General.CHINA:
      return "CHINA";
    case General.NUKE:
      return "NUKE";
    case General.TANK:
      return "TANK";
    case General.INFANTRY:
      return "INFANTRY";
    case General.GLA:
      return "GLA";
    case General.TOXIN:
      return "TOXIN";
    case General.STEALTH:
      return "STEALTH";
    case General.DEMO:
      return "DEMO";
    default:
      return "UNKNOWN";
  }
}

export enum Team {
  NONE = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  UNRECOGNIZED = -1,
}

export function teamFromJSON(object: any): Team {
  switch (object) {
    case 0:
    case "NONE":
      return Team.NONE;
    case 1:
    case "ONE":
      return Team.ONE;
    case 2:
    case "TWO":
      return Team.TWO;
    case 3:
    case "THREE":
      return Team.THREE;
    case 4:
    case "FOUR":
      return Team.FOUR;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Team.UNRECOGNIZED;
  }
}

export function teamToJSON(object: Team): string {
  switch (object) {
    case Team.NONE:
      return "NONE";
    case Team.ONE:
      return "ONE";
    case Team.TWO:
      return "TWO";
    case Team.THREE:
      return "THREE";
    case Team.FOUR:
      return "FOUR";
    default:
      return "UNKNOWN";
  }
}

export interface Player {
  name: string;
  general: General;
  team: Team;
}

export interface MatchInfo {
  id: number;
  timestamp: Date | undefined;
  map: string;
  winningTeam: Team;
  players: Player[];
}

export interface Matches {
  matches: MatchInfo[];
}

export interface SaveResponse {
  success: boolean;
}

/** The request message containing the user's name. */
export interface HelloRequest {
  name: string;
}

/** The response message containing the greetings */
export interface HelloReply {
  message: string;
}

function createBasePlayer(): Player {
  return { name: "", general: 0, team: 0 };
}

export const Player = {
  encode(
    message: Player,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.general !== 0) {
      writer.uint32(16).int32(message.general);
    }
    if (message.team !== 0) {
      writer.uint32(24).int32(message.team);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Player {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlayer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.general = reader.int32() as any;
          break;
        case 3:
          message.team = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Player {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      general: isSet(object.general) ? generalFromJSON(object.general) : 0,
      team: isSet(object.team) ? teamFromJSON(object.team) : 0,
    };
  },

  toJSON(message: Player): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.general !== undefined &&
      (obj.general = generalToJSON(message.general));
    message.team !== undefined && (obj.team = teamToJSON(message.team));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Player>, I>>(object: I): Player {
    const message = createBasePlayer();
    message.name = object.name ?? "";
    message.general = object.general ?? 0;
    message.team = object.team ?? 0;
    return message;
  },
};

function createBaseMatchInfo(): MatchInfo {
  return { id: 0, timestamp: undefined, map: "", winningTeam: 0, players: [] };
}

export const MatchInfo = {
  encode(
    message: MatchInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(
        toTimestamp(message.timestamp),
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.map !== "") {
      writer.uint32(26).string(message.map);
    }
    if (message.winningTeam !== 0) {
      writer.uint32(32).int32(message.winningTeam);
    }
    for (const v of message.players) {
      Player.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.int32();
          break;
        case 2:
          message.timestamp = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.map = reader.string();
          break;
        case 4:
          message.winningTeam = reader.int32() as any;
          break;
        case 5:
          message.players.push(Player.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MatchInfo {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      timestamp: isSet(object.timestamp)
        ? fromJsonTimestamp(object.timestamp)
        : undefined,
      map: isSet(object.map) ? String(object.map) : "",
      winningTeam: isSet(object.winningTeam)
        ? teamFromJSON(object.winningTeam)
        : 0,
      players: Array.isArray(object?.players)
        ? object.players.map((e: any) => Player.fromJSON(e))
        : [],
    };
  },

  toJSON(message: MatchInfo): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.timestamp !== undefined &&
      (obj.timestamp = message.timestamp.toISOString());
    message.map !== undefined && (obj.map = message.map);
    message.winningTeam !== undefined &&
      (obj.winningTeam = teamToJSON(message.winningTeam));
    if (message.players) {
      obj.players = message.players.map((e) =>
        e ? Player.toJSON(e) : undefined
      );
    } else {
      obj.players = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<MatchInfo>, I>>(
    object: I
  ): MatchInfo {
    const message = createBaseMatchInfo();
    message.id = object.id ?? 0;
    message.timestamp = object.timestamp ?? undefined;
    message.map = object.map ?? "";
    message.winningTeam = object.winningTeam ?? 0;
    message.players = object.players?.map((e) => Player.fromPartial(e)) || [];
    return message;
  },
};

function createBaseMatches(): Matches {
  return { matches: [] };
}

export const Matches = {
  encode(
    message: Matches,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.matches) {
      MatchInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matches {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatches();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.matches.push(MatchInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Matches {
    return {
      matches: Array.isArray(object?.matches)
        ? object.matches.map((e: any) => MatchInfo.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Matches): unknown {
    const obj: any = {};
    if (message.matches) {
      obj.matches = message.matches.map((e) =>
        e ? MatchInfo.toJSON(e) : undefined
      );
    } else {
      obj.matches = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Matches>, I>>(object: I): Matches {
    const message = createBaseMatches();
    message.matches =
      object.matches?.map((e) => MatchInfo.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSaveResponse(): SaveResponse {
  return { success: false };
}

export const SaveResponse = {
  encode(
    message: SaveResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SaveResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSaveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SaveResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
    };
  },

  toJSON(message: SaveResponse): unknown {
    const obj: any = {};
    message.success !== undefined && (obj.success = message.success);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SaveResponse>, I>>(
    object: I
  ): SaveResponse {
    const message = createBaseSaveResponse();
    message.success = object.success ?? false;
    return message;
  },
};

function createBaseHelloRequest(): HelloRequest {
  return { name: "" };
}

export const HelloRequest = {
  encode(
    message: HelloRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HelloRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHelloRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HelloRequest {
    return {
      name: isSet(object.name) ? String(object.name) : "",
    };
  },

  toJSON(message: HelloRequest): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HelloRequest>, I>>(
    object: I
  ): HelloRequest {
    const message = createBaseHelloRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseHelloReply(): HelloReply {
  return { message: "" };
}

export const HelloReply = {
  encode(
    message: HelloReply,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HelloReply {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHelloReply();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): HelloReply {
    return {
      message: isSet(object.message) ? String(object.message) : "",
    };
  },

  toJSON(message: HelloReply): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HelloReply>, I>>(
    object: I
  ): HelloReply {
    const message = createBaseHelloReply();
    message.message = object.message ?? "";
    return message;
  },
};

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === "string") {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
