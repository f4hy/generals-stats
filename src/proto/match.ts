/* eslint-disable */
import Long from "long"
import * as _m0 from "protobufjs/minimal"
import { Timestamp } from "../google/protobuf/timestamp"

export const protobufPackage = "matches"

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
      return General.USA
    case 1:
    case "AIR":
      return General.AIR
    case 2:
    case "LASER":
      return General.LASER
    case 3:
    case "SUPER":
      return General.SUPER
    case 4:
    case "CHINA":
      return General.CHINA
    case 5:
    case "NUKE":
      return General.NUKE
    case 6:
    case "TANK":
      return General.TANK
    case 7:
    case "INFANTRY":
      return General.INFANTRY
    case 8:
    case "GLA":
      return General.GLA
    case 9:
    case "TOXIN":
      return General.TOXIN
    case 10:
    case "STEALTH":
      return General.STEALTH
    case 11:
    case "DEMO":
      return General.DEMO
    case -1:
    case "UNRECOGNIZED":
    default:
      return General.UNRECOGNIZED
  }
}

export function generalToJSON(object: General): string {
  switch (object) {
    case General.USA:
      return "USA"
    case General.AIR:
      return "AIR"
    case General.LASER:
      return "LASER"
    case General.SUPER:
      return "SUPER"
    case General.CHINA:
      return "CHINA"
    case General.NUKE:
      return "NUKE"
    case General.TANK:
      return "TANK"
    case General.INFANTRY:
      return "INFANTRY"
    case General.GLA:
      return "GLA"
    case General.TOXIN:
      return "TOXIN"
    case General.STEALTH:
      return "STEALTH"
    case General.DEMO:
      return "DEMO"
    default:
      return "UNKNOWN"
  }
}

export enum Faction {
  ANYUSA = 0,
  ANYCHINA = 1,
  ANYGLA = 2,
  UNRECOGNIZED = -1,
}

export function factionFromJSON(object: any): Faction {
  switch (object) {
    case 0:
    case "ANYUSA":
      return Faction.ANYUSA
    case 1:
    case "ANYCHINA":
      return Faction.ANYCHINA
    case 2:
    case "ANYGLA":
      return Faction.ANYGLA
    case -1:
    case "UNRECOGNIZED":
    default:
      return Faction.UNRECOGNIZED
  }
}

export function factionToJSON(object: Faction): string {
  switch (object) {
    case Faction.ANYUSA:
      return "ANYUSA"
    case Faction.ANYCHINA:
      return "ANYCHINA"
    case Faction.ANYGLA:
      return "ANYGLA"
    default:
      return "UNKNOWN"
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
      return Team.NONE
    case 1:
    case "ONE":
      return Team.ONE
    case 2:
    case "TWO":
      return Team.TWO
    case 3:
    case "THREE":
      return Team.THREE
    case 4:
    case "FOUR":
      return Team.FOUR
    case -1:
    case "UNRECOGNIZED":
    default:
      return Team.UNRECOGNIZED
  }
}

export function teamToJSON(object: Team): string {
  switch (object) {
    case Team.NONE:
      return "NONE"
    case Team.ONE:
      return "ONE"
    case Team.TWO:
      return "TWO"
    case Team.THREE:
      return "THREE"
    case Team.FOUR:
      return "FOUR"
    default:
      return "UNKNOWN"
  }
}

export interface Player {
  name: string
  general: General
  team: Team
}

export interface MatchInfo {
  id: number
  timestamp: Date | undefined
  map: string
  winningTeam: Team
  players: Player[]
  durationMinutes: number
}

export interface Matches {
  matches: MatchInfo[]
}

export interface WinLoss {
  wins: number
  losses: number
}

export interface PlayerStat {
  playerName: string
  stats: PlayerStat_GeneralWL[]
  factionStats: PlayerStat_FactionWL[]
}

export interface PlayerStat_GeneralWL {
  general: General
  winLoss: WinLoss | undefined
}

export interface PlayerStat_FactionWL {
  faction: Faction
  winLoss: WinLoss | undefined
}

export interface PlayerStats {
  playerStats: PlayerStat[]
}

export interface GeneralStat {
  general: General
  stats: GeneralStat_PlayerWL[]
  total: WinLoss | undefined
}

export interface GeneralStat_PlayerWL {
  playerName: string
  winLoss: WinLoss | undefined
}

export interface GeneralStats {
  generalStats: GeneralStat[]
}

export interface DateMessage {
  Year: number
  Month: number
  Day: number
}

export interface TeamStat {
  date: DateMessage | undefined
  team: Team
  wins: number
}

export interface TeamStats {
  teamStats: TeamStat[]
}

export interface MapStat {
  map: string
  team: Team
  wins: number
}

export interface MapStats {
  mapStats: MapStat[]
}

export interface SaveResponse {
  success: boolean
}

export interface Costs {
  player: Player | undefined
  buildings: Costs_BuiltObject[]
  units: Costs_BuiltObject[]
}

export interface Costs_BuiltObject {
  name: string
  count: number
  totalSpent: number
}

export interface APM {
  playerName: string
  actionCount: number
  minutes: number
  apm: number
}

export interface UpgradeEvent {
  playerName: string
  timecode: number
  upgradeName: string
  cost: number
}

export interface Upgrades {
  upgrades: UpgradeEvent[]
}

export interface MatchDetails {
  matchId: number
  costs: Costs[]
  apms: APM[]
  upgradeEvents: { [key: string]: Upgrades }
}

export interface MatchDetails_UpgradeEventsEntry {
  key: string
  value: Upgrades | undefined
}

function createBasePlayer(): Player {
  return { name: "", general: 0, team: 0 }
}

export const Player = {
  encode(
    message: Player,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name)
    }
    if (message.general !== 0) {
      writer.uint32(16).int32(message.general)
    }
    if (message.team !== 0) {
      writer.uint32(24).int32(message.team)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Player {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlayer()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string()
          break
        case 2:
          message.general = reader.int32() as any
          break
        case 3:
          message.team = reader.int32() as any
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Player {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      general: isSet(object.general) ? generalFromJSON(object.general) : 0,
      team: isSet(object.team) ? teamFromJSON(object.team) : 0,
    }
  },

  toJSON(message: Player): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.general !== undefined &&
      (obj.general = generalToJSON(message.general))
    message.team !== undefined && (obj.team = teamToJSON(message.team))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Player>, I>>(object: I): Player {
    const message = createBasePlayer()
    message.name = object.name ?? ""
    message.general = object.general ?? 0
    message.team = object.team ?? 0
    return message
  },
}

function createBaseMatchInfo(): MatchInfo {
  return {
    id: 0,
    timestamp: undefined,
    map: "",
    winningTeam: 0,
    players: [],
    durationMinutes: 0,
  }
}

export const MatchInfo = {
  encode(
    message: MatchInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int64(message.id)
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(
        toTimestamp(message.timestamp),
        writer.uint32(18).fork()
      ).ldelim()
    }
    if (message.map !== "") {
      writer.uint32(26).string(message.map)
    }
    if (message.winningTeam !== 0) {
      writer.uint32(32).int32(message.winningTeam)
    }
    for (const v of message.players) {
      Player.encode(v!, writer.uint32(42).fork()).ldelim()
    }
    if (message.durationMinutes !== 0) {
      writer.uint32(49).double(message.durationMinutes)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMatchInfo()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.id = longToNumber(reader.int64() as Long)
          break
        case 2:
          message.timestamp = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          )
          break
        case 3:
          message.map = reader.string()
          break
        case 4:
          message.winningTeam = reader.int32() as any
          break
        case 5:
          message.players.push(Player.decode(reader, reader.uint32()))
          break
        case 6:
          message.durationMinutes = reader.double()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
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
      durationMinutes: isSet(object.durationMinutes)
        ? Number(object.durationMinutes)
        : 0,
    }
  },

  toJSON(message: MatchInfo): unknown {
    const obj: any = {}
    message.id !== undefined && (obj.id = Math.round(message.id))
    message.timestamp !== undefined &&
      (obj.timestamp = message.timestamp.toISOString())
    message.map !== undefined && (obj.map = message.map)
    message.winningTeam !== undefined &&
      (obj.winningTeam = teamToJSON(message.winningTeam))
    if (message.players) {
      obj.players = message.players.map((e) =>
        e ? Player.toJSON(e) : undefined
      )
    } else {
      obj.players = []
    }
    message.durationMinutes !== undefined &&
      (obj.durationMinutes = message.durationMinutes)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MatchInfo>, I>>(
    object: I
  ): MatchInfo {
    const message = createBaseMatchInfo()
    message.id = object.id ?? 0
    message.timestamp = object.timestamp ?? undefined
    message.map = object.map ?? ""
    message.winningTeam = object.winningTeam ?? 0
    message.players = object.players?.map((e) => Player.fromPartial(e)) || []
    message.durationMinutes = object.durationMinutes ?? 0
    return message
  },
}

function createBaseMatches(): Matches {
  return { matches: [] }
}

export const Matches = {
  encode(
    message: Matches,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.matches) {
      MatchInfo.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Matches {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMatches()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.matches.push(MatchInfo.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Matches {
    return {
      matches: Array.isArray(object?.matches)
        ? object.matches.map((e: any) => MatchInfo.fromJSON(e))
        : [],
    }
  },

  toJSON(message: Matches): unknown {
    const obj: any = {}
    if (message.matches) {
      obj.matches = message.matches.map((e) =>
        e ? MatchInfo.toJSON(e) : undefined
      )
    } else {
      obj.matches = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Matches>, I>>(object: I): Matches {
    const message = createBaseMatches()
    message.matches = object.matches?.map((e) => MatchInfo.fromPartial(e)) || []
    return message
  },
}

function createBaseWinLoss(): WinLoss {
  return { wins: 0, losses: 0 }
}

export const WinLoss = {
  encode(
    message: WinLoss,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.wins !== 0) {
      writer.uint32(8).int32(message.wins)
    }
    if (message.losses !== 0) {
      writer.uint32(16).int32(message.losses)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): WinLoss {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseWinLoss()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.wins = reader.int32()
          break
        case 2:
          message.losses = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): WinLoss {
    return {
      wins: isSet(object.wins) ? Number(object.wins) : 0,
      losses: isSet(object.losses) ? Number(object.losses) : 0,
    }
  },

  toJSON(message: WinLoss): unknown {
    const obj: any = {}
    message.wins !== undefined && (obj.wins = Math.round(message.wins))
    message.losses !== undefined && (obj.losses = Math.round(message.losses))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<WinLoss>, I>>(object: I): WinLoss {
    const message = createBaseWinLoss()
    message.wins = object.wins ?? 0
    message.losses = object.losses ?? 0
    return message
  },
}

function createBasePlayerStat(): PlayerStat {
  return { playerName: "", stats: [], factionStats: [] }
}

export const PlayerStat = {
  encode(
    message: PlayerStat,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.playerName !== "") {
      writer.uint32(10).string(message.playerName)
    }
    for (const v of message.stats) {
      PlayerStat_GeneralWL.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    for (const v of message.factionStats) {
      PlayerStat_FactionWL.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerStat {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlayerStat()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.playerName = reader.string()
          break
        case 2:
          message.stats.push(
            PlayerStat_GeneralWL.decode(reader, reader.uint32())
          )
          break
        case 3:
          message.factionStats.push(
            PlayerStat_FactionWL.decode(reader, reader.uint32())
          )
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PlayerStat {
    return {
      playerName: isSet(object.playerName) ? String(object.playerName) : "",
      stats: Array.isArray(object?.stats)
        ? object.stats.map((e: any) => PlayerStat_GeneralWL.fromJSON(e))
        : [],
      factionStats: Array.isArray(object?.factionStats)
        ? object.factionStats.map((e: any) => PlayerStat_FactionWL.fromJSON(e))
        : [],
    }
  },

  toJSON(message: PlayerStat): unknown {
    const obj: any = {}
    message.playerName !== undefined && (obj.playerName = message.playerName)
    if (message.stats) {
      obj.stats = message.stats.map((e) =>
        e ? PlayerStat_GeneralWL.toJSON(e) : undefined
      )
    } else {
      obj.stats = []
    }
    if (message.factionStats) {
      obj.factionStats = message.factionStats.map((e) =>
        e ? PlayerStat_FactionWL.toJSON(e) : undefined
      )
    } else {
      obj.factionStats = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PlayerStat>, I>>(
    object: I
  ): PlayerStat {
    const message = createBasePlayerStat()
    message.playerName = object.playerName ?? ""
    message.stats =
      object.stats?.map((e) => PlayerStat_GeneralWL.fromPartial(e)) || []
    message.factionStats =
      object.factionStats?.map((e) => PlayerStat_FactionWL.fromPartial(e)) || []
    return message
  },
}

function createBasePlayerStat_GeneralWL(): PlayerStat_GeneralWL {
  return { general: 0, winLoss: undefined }
}

export const PlayerStat_GeneralWL = {
  encode(
    message: PlayerStat_GeneralWL,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.general !== 0) {
      writer.uint32(8).int32(message.general)
    }
    if (message.winLoss !== undefined) {
      WinLoss.encode(message.winLoss, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PlayerStat_GeneralWL {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlayerStat_GeneralWL()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.general = reader.int32() as any
          break
        case 2:
          message.winLoss = WinLoss.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PlayerStat_GeneralWL {
    return {
      general: isSet(object.general) ? generalFromJSON(object.general) : 0,
      winLoss: isSet(object.winLoss)
        ? WinLoss.fromJSON(object.winLoss)
        : undefined,
    }
  },

  toJSON(message: PlayerStat_GeneralWL): unknown {
    const obj: any = {}
    message.general !== undefined &&
      (obj.general = generalToJSON(message.general))
    message.winLoss !== undefined &&
      (obj.winLoss = message.winLoss
        ? WinLoss.toJSON(message.winLoss)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PlayerStat_GeneralWL>, I>>(
    object: I
  ): PlayerStat_GeneralWL {
    const message = createBasePlayerStat_GeneralWL()
    message.general = object.general ?? 0
    message.winLoss =
      object.winLoss !== undefined && object.winLoss !== null
        ? WinLoss.fromPartial(object.winLoss)
        : undefined
    return message
  },
}

function createBasePlayerStat_FactionWL(): PlayerStat_FactionWL {
  return { faction: 0, winLoss: undefined }
}

export const PlayerStat_FactionWL = {
  encode(
    message: PlayerStat_FactionWL,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.faction !== 0) {
      writer.uint32(8).int32(message.faction)
    }
    if (message.winLoss !== undefined) {
      WinLoss.encode(message.winLoss, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PlayerStat_FactionWL {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlayerStat_FactionWL()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.faction = reader.int32() as any
          break
        case 2:
          message.winLoss = WinLoss.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PlayerStat_FactionWL {
    return {
      faction: isSet(object.faction) ? factionFromJSON(object.faction) : 0,
      winLoss: isSet(object.winLoss)
        ? WinLoss.fromJSON(object.winLoss)
        : undefined,
    }
  },

  toJSON(message: PlayerStat_FactionWL): unknown {
    const obj: any = {}
    message.faction !== undefined &&
      (obj.faction = factionToJSON(message.faction))
    message.winLoss !== undefined &&
      (obj.winLoss = message.winLoss
        ? WinLoss.toJSON(message.winLoss)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PlayerStat_FactionWL>, I>>(
    object: I
  ): PlayerStat_FactionWL {
    const message = createBasePlayerStat_FactionWL()
    message.faction = object.faction ?? 0
    message.winLoss =
      object.winLoss !== undefined && object.winLoss !== null
        ? WinLoss.fromPartial(object.winLoss)
        : undefined
    return message
  },
}

function createBasePlayerStats(): PlayerStats {
  return { playerStats: [] }
}

export const PlayerStats = {
  encode(
    message: PlayerStats,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.playerStats) {
      PlayerStat.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlayerStats {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlayerStats()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.playerStats.push(PlayerStat.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PlayerStats {
    return {
      playerStats: Array.isArray(object?.playerStats)
        ? object.playerStats.map((e: any) => PlayerStat.fromJSON(e))
        : [],
    }
  },

  toJSON(message: PlayerStats): unknown {
    const obj: any = {}
    if (message.playerStats) {
      obj.playerStats = message.playerStats.map((e) =>
        e ? PlayerStat.toJSON(e) : undefined
      )
    } else {
      obj.playerStats = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<PlayerStats>, I>>(
    object: I
  ): PlayerStats {
    const message = createBasePlayerStats()
    message.playerStats =
      object.playerStats?.map((e) => PlayerStat.fromPartial(e)) || []
    return message
  },
}

function createBaseGeneralStat(): GeneralStat {
  return { general: 0, stats: [], total: undefined }
}

export const GeneralStat = {
  encode(
    message: GeneralStat,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.general !== 0) {
      writer.uint32(8).int32(message.general)
    }
    for (const v of message.stats) {
      GeneralStat_PlayerWL.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    if (message.total !== undefined) {
      WinLoss.encode(message.total, writer.uint32(26).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GeneralStat {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGeneralStat()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.general = reader.int32() as any
          break
        case 2:
          message.stats.push(
            GeneralStat_PlayerWL.decode(reader, reader.uint32())
          )
          break
        case 3:
          message.total = WinLoss.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GeneralStat {
    return {
      general: isSet(object.general) ? generalFromJSON(object.general) : 0,
      stats: Array.isArray(object?.stats)
        ? object.stats.map((e: any) => GeneralStat_PlayerWL.fromJSON(e))
        : [],
      total: isSet(object.total) ? WinLoss.fromJSON(object.total) : undefined,
    }
  },

  toJSON(message: GeneralStat): unknown {
    const obj: any = {}
    message.general !== undefined &&
      (obj.general = generalToJSON(message.general))
    if (message.stats) {
      obj.stats = message.stats.map((e) =>
        e ? GeneralStat_PlayerWL.toJSON(e) : undefined
      )
    } else {
      obj.stats = []
    }
    message.total !== undefined &&
      (obj.total = message.total ? WinLoss.toJSON(message.total) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GeneralStat>, I>>(
    object: I
  ): GeneralStat {
    const message = createBaseGeneralStat()
    message.general = object.general ?? 0
    message.stats =
      object.stats?.map((e) => GeneralStat_PlayerWL.fromPartial(e)) || []
    message.total =
      object.total !== undefined && object.total !== null
        ? WinLoss.fromPartial(object.total)
        : undefined
    return message
  },
}

function createBaseGeneralStat_PlayerWL(): GeneralStat_PlayerWL {
  return { playerName: "", winLoss: undefined }
}

export const GeneralStat_PlayerWL = {
  encode(
    message: GeneralStat_PlayerWL,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.playerName !== "") {
      writer.uint32(10).string(message.playerName)
    }
    if (message.winLoss !== undefined) {
      WinLoss.encode(message.winLoss, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GeneralStat_PlayerWL {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGeneralStat_PlayerWL()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.playerName = reader.string()
          break
        case 2:
          message.winLoss = WinLoss.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GeneralStat_PlayerWL {
    return {
      playerName: isSet(object.playerName) ? String(object.playerName) : "",
      winLoss: isSet(object.winLoss)
        ? WinLoss.fromJSON(object.winLoss)
        : undefined,
    }
  },

  toJSON(message: GeneralStat_PlayerWL): unknown {
    const obj: any = {}
    message.playerName !== undefined && (obj.playerName = message.playerName)
    message.winLoss !== undefined &&
      (obj.winLoss = message.winLoss
        ? WinLoss.toJSON(message.winLoss)
        : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GeneralStat_PlayerWL>, I>>(
    object: I
  ): GeneralStat_PlayerWL {
    const message = createBaseGeneralStat_PlayerWL()
    message.playerName = object.playerName ?? ""
    message.winLoss =
      object.winLoss !== undefined && object.winLoss !== null
        ? WinLoss.fromPartial(object.winLoss)
        : undefined
    return message
  },
}

function createBaseGeneralStats(): GeneralStats {
  return { generalStats: [] }
}

export const GeneralStats = {
  encode(
    message: GeneralStats,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.generalStats) {
      GeneralStat.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GeneralStats {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseGeneralStats()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.generalStats.push(GeneralStat.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): GeneralStats {
    return {
      generalStats: Array.isArray(object?.generalStats)
        ? object.generalStats.map((e: any) => GeneralStat.fromJSON(e))
        : [],
    }
  },

  toJSON(message: GeneralStats): unknown {
    const obj: any = {}
    if (message.generalStats) {
      obj.generalStats = message.generalStats.map((e) =>
        e ? GeneralStat.toJSON(e) : undefined
      )
    } else {
      obj.generalStats = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<GeneralStats>, I>>(
    object: I
  ): GeneralStats {
    const message = createBaseGeneralStats()
    message.generalStats =
      object.generalStats?.map((e) => GeneralStat.fromPartial(e)) || []
    return message
  },
}

function createBaseDateMessage(): DateMessage {
  return { Year: 0, Month: 0, Day: 0 }
}

export const DateMessage = {
  encode(
    message: DateMessage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.Year !== 0) {
      writer.uint32(8).int32(message.Year)
    }
    if (message.Month !== 0) {
      writer.uint32(16).int32(message.Month)
    }
    if (message.Day !== 0) {
      writer.uint32(24).int32(message.Day)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DateMessage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDateMessage()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.Year = reader.int32()
          break
        case 2:
          message.Month = reader.int32()
          break
        case 3:
          message.Day = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DateMessage {
    return {
      Year: isSet(object.Year) ? Number(object.Year) : 0,
      Month: isSet(object.Month) ? Number(object.Month) : 0,
      Day: isSet(object.Day) ? Number(object.Day) : 0,
    }
  },

  toJSON(message: DateMessage): unknown {
    const obj: any = {}
    message.Year !== undefined && (obj.Year = Math.round(message.Year))
    message.Month !== undefined && (obj.Month = Math.round(message.Month))
    message.Day !== undefined && (obj.Day = Math.round(message.Day))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<DateMessage>, I>>(
    object: I
  ): DateMessage {
    const message = createBaseDateMessage()
    message.Year = object.Year ?? 0
    message.Month = object.Month ?? 0
    message.Day = object.Day ?? 0
    return message
  },
}

function createBaseTeamStat(): TeamStat {
  return { date: undefined, team: 0, wins: 0 }
}

export const TeamStat = {
  encode(
    message: TeamStat,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.date !== undefined) {
      DateMessage.encode(message.date, writer.uint32(10).fork()).ldelim()
    }
    if (message.team !== 0) {
      writer.uint32(16).int32(message.team)
    }
    if (message.wins !== 0) {
      writer.uint32(24).int32(message.wins)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamStat {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTeamStat()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.date = DateMessage.decode(reader, reader.uint32())
          break
        case 2:
          message.team = reader.int32() as any
          break
        case 3:
          message.wins = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TeamStat {
    return {
      date: isSet(object.date) ? DateMessage.fromJSON(object.date) : undefined,
      team: isSet(object.team) ? teamFromJSON(object.team) : 0,
      wins: isSet(object.wins) ? Number(object.wins) : 0,
    }
  },

  toJSON(message: TeamStat): unknown {
    const obj: any = {}
    message.date !== undefined &&
      (obj.date = message.date ? DateMessage.toJSON(message.date) : undefined)
    message.team !== undefined && (obj.team = teamToJSON(message.team))
    message.wins !== undefined && (obj.wins = Math.round(message.wins))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<TeamStat>, I>>(object: I): TeamStat {
    const message = createBaseTeamStat()
    message.date =
      object.date !== undefined && object.date !== null
        ? DateMessage.fromPartial(object.date)
        : undefined
    message.team = object.team ?? 0
    message.wins = object.wins ?? 0
    return message
  },
}

function createBaseTeamStats(): TeamStats {
  return { teamStats: [] }
}

export const TeamStats = {
  encode(
    message: TeamStats,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.teamStats) {
      TeamStat.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TeamStats {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseTeamStats()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.teamStats.push(TeamStat.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): TeamStats {
    return {
      teamStats: Array.isArray(object?.teamStats)
        ? object.teamStats.map((e: any) => TeamStat.fromJSON(e))
        : [],
    }
  },

  toJSON(message: TeamStats): unknown {
    const obj: any = {}
    if (message.teamStats) {
      obj.teamStats = message.teamStats.map((e) =>
        e ? TeamStat.toJSON(e) : undefined
      )
    } else {
      obj.teamStats = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<TeamStats>, I>>(
    object: I
  ): TeamStats {
    const message = createBaseTeamStats()
    message.teamStats =
      object.teamStats?.map((e) => TeamStat.fromPartial(e)) || []
    return message
  },
}

function createBaseMapStat(): MapStat {
  return { map: "", team: 0, wins: 0 }
}

export const MapStat = {
  encode(
    message: MapStat,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.map !== "") {
      writer.uint32(10).string(message.map)
    }
    if (message.team !== 0) {
      writer.uint32(16).int32(message.team)
    }
    if (message.wins !== 0) {
      writer.uint32(24).int32(message.wins)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MapStat {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMapStat()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.map = reader.string()
          break
        case 2:
          message.team = reader.int32() as any
          break
        case 3:
          message.wins = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MapStat {
    return {
      map: isSet(object.map) ? String(object.map) : "",
      team: isSet(object.team) ? teamFromJSON(object.team) : 0,
      wins: isSet(object.wins) ? Number(object.wins) : 0,
    }
  },

  toJSON(message: MapStat): unknown {
    const obj: any = {}
    message.map !== undefined && (obj.map = message.map)
    message.team !== undefined && (obj.team = teamToJSON(message.team))
    message.wins !== undefined && (obj.wins = Math.round(message.wins))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MapStat>, I>>(object: I): MapStat {
    const message = createBaseMapStat()
    message.map = object.map ?? ""
    message.team = object.team ?? 0
    message.wins = object.wins ?? 0
    return message
  },
}

function createBaseMapStats(): MapStats {
  return { mapStats: [] }
}

export const MapStats = {
  encode(
    message: MapStats,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.mapStats) {
      MapStat.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MapStats {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMapStats()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.mapStats.push(MapStat.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MapStats {
    return {
      mapStats: Array.isArray(object?.mapStats)
        ? object.mapStats.map((e: any) => MapStat.fromJSON(e))
        : [],
    }
  },

  toJSON(message: MapStats): unknown {
    const obj: any = {}
    if (message.mapStats) {
      obj.mapStats = message.mapStats.map((e) =>
        e ? MapStat.toJSON(e) : undefined
      )
    } else {
      obj.mapStats = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MapStats>, I>>(object: I): MapStats {
    const message = createBaseMapStats()
    message.mapStats = object.mapStats?.map((e) => MapStat.fromPartial(e)) || []
    return message
  },
}

function createBaseSaveResponse(): SaveResponse {
  return { success: false }
}

export const SaveResponse = {
  encode(
    message: SaveResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SaveResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseSaveResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): SaveResponse {
    return {
      success: isSet(object.success) ? Boolean(object.success) : false,
    }
  },

  toJSON(message: SaveResponse): unknown {
    const obj: any = {}
    message.success !== undefined && (obj.success = message.success)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<SaveResponse>, I>>(
    object: I
  ): SaveResponse {
    const message = createBaseSaveResponse()
    message.success = object.success ?? false
    return message
  },
}

function createBaseCosts(): Costs {
  return { player: undefined, buildings: [], units: [] }
}

export const Costs = {
  encode(message: Costs, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.player !== undefined) {
      Player.encode(message.player, writer.uint32(18).fork()).ldelim()
    }
    for (const v of message.buildings) {
      Costs_BuiltObject.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    for (const v of message.units) {
      Costs_BuiltObject.encode(v!, writer.uint32(34).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Costs {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCosts()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 2:
          message.player = Player.decode(reader, reader.uint32())
          break
        case 3:
          message.buildings.push(
            Costs_BuiltObject.decode(reader, reader.uint32())
          )
          break
        case 4:
          message.units.push(Costs_BuiltObject.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Costs {
    return {
      player: isSet(object.player) ? Player.fromJSON(object.player) : undefined,
      buildings: Array.isArray(object?.buildings)
        ? object.buildings.map((e: any) => Costs_BuiltObject.fromJSON(e))
        : [],
      units: Array.isArray(object?.units)
        ? object.units.map((e: any) => Costs_BuiltObject.fromJSON(e))
        : [],
    }
  },

  toJSON(message: Costs): unknown {
    const obj: any = {}
    message.player !== undefined &&
      (obj.player = message.player ? Player.toJSON(message.player) : undefined)
    if (message.buildings) {
      obj.buildings = message.buildings.map((e) =>
        e ? Costs_BuiltObject.toJSON(e) : undefined
      )
    } else {
      obj.buildings = []
    }
    if (message.units) {
      obj.units = message.units.map((e) =>
        e ? Costs_BuiltObject.toJSON(e) : undefined
      )
    } else {
      obj.units = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Costs>, I>>(object: I): Costs {
    const message = createBaseCosts()
    message.player =
      object.player !== undefined && object.player !== null
        ? Player.fromPartial(object.player)
        : undefined
    message.buildings =
      object.buildings?.map((e) => Costs_BuiltObject.fromPartial(e)) || []
    message.units =
      object.units?.map((e) => Costs_BuiltObject.fromPartial(e)) || []
    return message
  },
}

function createBaseCosts_BuiltObject(): Costs_BuiltObject {
  return { name: "", count: 0, totalSpent: 0 }
}

export const Costs_BuiltObject = {
  encode(
    message: Costs_BuiltObject,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name)
    }
    if (message.count !== 0) {
      writer.uint32(16).int32(message.count)
    }
    if (message.totalSpent !== 0) {
      writer.uint32(24).int32(message.totalSpent)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Costs_BuiltObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCosts_BuiltObject()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string()
          break
        case 2:
          message.count = reader.int32()
          break
        case 3:
          message.totalSpent = reader.int32()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Costs_BuiltObject {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      count: isSet(object.count) ? Number(object.count) : 0,
      totalSpent: isSet(object.totalSpent) ? Number(object.totalSpent) : 0,
    }
  },

  toJSON(message: Costs_BuiltObject): unknown {
    const obj: any = {}
    message.name !== undefined && (obj.name = message.name)
    message.count !== undefined && (obj.count = Math.round(message.count))
    message.totalSpent !== undefined &&
      (obj.totalSpent = Math.round(message.totalSpent))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Costs_BuiltObject>, I>>(
    object: I
  ): Costs_BuiltObject {
    const message = createBaseCosts_BuiltObject()
    message.name = object.name ?? ""
    message.count = object.count ?? 0
    message.totalSpent = object.totalSpent ?? 0
    return message
  },
}

function createBaseAPM(): APM {
  return { playerName: "", actionCount: 0, minutes: 0, apm: 0 }
}

export const APM = {
  encode(message: APM, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.playerName !== "") {
      writer.uint32(10).string(message.playerName)
    }
    if (message.actionCount !== 0) {
      writer.uint32(16).int64(message.actionCount)
    }
    if (message.minutes !== 0) {
      writer.uint32(25).double(message.minutes)
    }
    if (message.apm !== 0) {
      writer.uint32(33).double(message.apm)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): APM {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseAPM()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.playerName = reader.string()
          break
        case 2:
          message.actionCount = longToNumber(reader.int64() as Long)
          break
        case 3:
          message.minutes = reader.double()
          break
        case 4:
          message.apm = reader.double()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): APM {
    return {
      playerName: isSet(object.playerName) ? String(object.playerName) : "",
      actionCount: isSet(object.actionCount) ? Number(object.actionCount) : 0,
      minutes: isSet(object.minutes) ? Number(object.minutes) : 0,
      apm: isSet(object.apm) ? Number(object.apm) : 0,
    }
  },

  toJSON(message: APM): unknown {
    const obj: any = {}
    message.playerName !== undefined && (obj.playerName = message.playerName)
    message.actionCount !== undefined &&
      (obj.actionCount = Math.round(message.actionCount))
    message.minutes !== undefined && (obj.minutes = message.minutes)
    message.apm !== undefined && (obj.apm = message.apm)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<APM>, I>>(object: I): APM {
    const message = createBaseAPM()
    message.playerName = object.playerName ?? ""
    message.actionCount = object.actionCount ?? 0
    message.minutes = object.minutes ?? 0
    message.apm = object.apm ?? 0
    return message
  },
}

function createBaseUpgradeEvent(): UpgradeEvent {
  return { playerName: "", timecode: 0, upgradeName: "", cost: 0 }
}

export const UpgradeEvent = {
  encode(
    message: UpgradeEvent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.playerName !== "") {
      writer.uint32(10).string(message.playerName)
    }
    if (message.timecode !== 0) {
      writer.uint32(16).int64(message.timecode)
    }
    if (message.upgradeName !== "") {
      writer.uint32(26).string(message.upgradeName)
    }
    if (message.cost !== 0) {
      writer.uint32(32).int64(message.cost)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpgradeEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpgradeEvent()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.playerName = reader.string()
          break
        case 2:
          message.timecode = longToNumber(reader.int64() as Long)
          break
        case 3:
          message.upgradeName = reader.string()
          break
        case 4:
          message.cost = longToNumber(reader.int64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): UpgradeEvent {
    return {
      playerName: isSet(object.playerName) ? String(object.playerName) : "",
      timecode: isSet(object.timecode) ? Number(object.timecode) : 0,
      upgradeName: isSet(object.upgradeName) ? String(object.upgradeName) : "",
      cost: isSet(object.cost) ? Number(object.cost) : 0,
    }
  },

  toJSON(message: UpgradeEvent): unknown {
    const obj: any = {}
    message.playerName !== undefined && (obj.playerName = message.playerName)
    message.timecode !== undefined &&
      (obj.timecode = Math.round(message.timecode))
    message.upgradeName !== undefined && (obj.upgradeName = message.upgradeName)
    message.cost !== undefined && (obj.cost = Math.round(message.cost))
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<UpgradeEvent>, I>>(
    object: I
  ): UpgradeEvent {
    const message = createBaseUpgradeEvent()
    message.playerName = object.playerName ?? ""
    message.timecode = object.timecode ?? 0
    message.upgradeName = object.upgradeName ?? ""
    message.cost = object.cost ?? 0
    return message
  },
}

function createBaseUpgrades(): Upgrades {
  return { upgrades: [] }
}

export const Upgrades = {
  encode(
    message: Upgrades,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.upgrades) {
      UpgradeEvent.encode(v!, writer.uint32(10).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Upgrades {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseUpgrades()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.upgrades.push(UpgradeEvent.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Upgrades {
    return {
      upgrades: Array.isArray(object?.upgrades)
        ? object.upgrades.map((e: any) => UpgradeEvent.fromJSON(e))
        : [],
    }
  },

  toJSON(message: Upgrades): unknown {
    const obj: any = {}
    if (message.upgrades) {
      obj.upgrades = message.upgrades.map((e) =>
        e ? UpgradeEvent.toJSON(e) : undefined
      )
    } else {
      obj.upgrades = []
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<Upgrades>, I>>(object: I): Upgrades {
    const message = createBaseUpgrades()
    message.upgrades =
      object.upgrades?.map((e) => UpgradeEvent.fromPartial(e)) || []
    return message
  },
}

function createBaseMatchDetails(): MatchDetails {
  return { matchId: 0, costs: [], apms: [], upgradeEvents: {} }
}

export const MatchDetails = {
  encode(
    message: MatchDetails,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.matchId !== 0) {
      writer.uint32(8).int64(message.matchId)
    }
    for (const v of message.costs) {
      Costs.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    for (const v of message.apms) {
      APM.encode(v!, writer.uint32(26).fork()).ldelim()
    }
    Object.entries(message.upgradeEvents).forEach(([key, value]) => {
      MatchDetails_UpgradeEventsEntry.encode(
        { key: key as any, value },
        writer.uint32(34).fork()
      ).ldelim()
    })
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchDetails {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMatchDetails()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.matchId = longToNumber(reader.int64() as Long)
          break
        case 2:
          message.costs.push(Costs.decode(reader, reader.uint32()))
          break
        case 3:
          message.apms.push(APM.decode(reader, reader.uint32()))
          break
        case 4:
          const entry4 = MatchDetails_UpgradeEventsEntry.decode(
            reader,
            reader.uint32()
          )
          if (entry4.value !== undefined) {
            message.upgradeEvents[entry4.key] = entry4.value
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MatchDetails {
    return {
      matchId: isSet(object.matchId) ? Number(object.matchId) : 0,
      costs: Array.isArray(object?.costs)
        ? object.costs.map((e: any) => Costs.fromJSON(e))
        : [],
      apms: Array.isArray(object?.apms)
        ? object.apms.map((e: any) => APM.fromJSON(e))
        : [],
      upgradeEvents: isObject(object.upgradeEvents)
        ? Object.entries(object.upgradeEvents).reduce<{
            [key: string]: Upgrades
          }>((acc, [key, value]) => {
            acc[key] = Upgrades.fromJSON(value)
            return acc
          }, {})
        : {},
    }
  },

  toJSON(message: MatchDetails): unknown {
    const obj: any = {}
    message.matchId !== undefined && (obj.matchId = Math.round(message.matchId))
    if (message.costs) {
      obj.costs = message.costs.map((e) => (e ? Costs.toJSON(e) : undefined))
    } else {
      obj.costs = []
    }
    if (message.apms) {
      obj.apms = message.apms.map((e) => (e ? APM.toJSON(e) : undefined))
    } else {
      obj.apms = []
    }
    obj.upgradeEvents = {}
    if (message.upgradeEvents) {
      Object.entries(message.upgradeEvents).forEach(([k, v]) => {
        obj.upgradeEvents[k] = Upgrades.toJSON(v)
      })
    }
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails>, I>>(
    object: I
  ): MatchDetails {
    const message = createBaseMatchDetails()
    message.matchId = object.matchId ?? 0
    message.costs = object.costs?.map((e) => Costs.fromPartial(e)) || []
    message.apms = object.apms?.map((e) => APM.fromPartial(e)) || []
    message.upgradeEvents = Object.entries(object.upgradeEvents ?? {}).reduce<{
      [key: string]: Upgrades
    }>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = Upgrades.fromPartial(value)
      }
      return acc
    }, {})
    return message
  },
}

function createBaseMatchDetails_UpgradeEventsEntry(): MatchDetails_UpgradeEventsEntry {
  return { key: "", value: undefined }
}

export const MatchDetails_UpgradeEventsEntry = {
  encode(
    message: MatchDetails_UpgradeEventsEntry,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key)
    }
    if (message.value !== undefined) {
      Upgrades.encode(message.value, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MatchDetails_UpgradeEventsEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseMatchDetails_UpgradeEventsEntry()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string()
          break
        case 2:
          message.value = Upgrades.decode(reader, reader.uint32())
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): MatchDetails_UpgradeEventsEntry {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? Upgrades.fromJSON(object.value) : undefined,
    }
  },

  toJSON(message: MatchDetails_UpgradeEventsEntry): unknown {
    const obj: any = {}
    message.key !== undefined && (obj.key = message.key)
    message.value !== undefined &&
      (obj.value = message.value ? Upgrades.toJSON(message.value) : undefined)
    return obj
  },

  fromPartial<I extends Exact<DeepPartial<MatchDetails_UpgradeEventsEntry>, I>>(
    object: I
  ): MatchDetails_UpgradeEventsEntry {
    const message = createBaseMatchDetails_UpgradeEventsEntry()
    message.key = object.key ?? ""
    message.value =
      object.value !== undefined && object.value !== null
        ? Upgrades.fromPartial(object.value)
        : undefined
    return message
  },
}

declare var self: any | undefined
declare var window: any | undefined
declare var global: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis
  if (typeof self !== "undefined") return self
  if (typeof window !== "undefined") return window
  if (typeof global !== "undefined") return global
  throw "Unable to locate global object"
})()

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

type KeysOfUnion<T> = T extends T ? keyof T : never
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000
  const nanos = (date.getTime() % 1_000) * 1_000_000
  return { seconds, nanos }
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000
  millis += t.nanos / 1_000_000
  return new Date(millis)
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o
  } else if (typeof o === "string") {
    return new Date(o)
  } else {
    return fromTimestamp(Timestamp.fromJSON(o))
  }
}

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER")
  }
  return long.toNumber()
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
