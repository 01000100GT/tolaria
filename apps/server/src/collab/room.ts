import { Awareness, removeAwarenessStates } from 'y-protocols/awareness'
import * as Y from 'yjs'
import { awarenessMessage, receive, syncStep1, updateMessage } from '../../../../packages/protocol/src/collabWire.ts'

/** One websocket of one client, as far as a room is concerned. */
export interface Peer {
  readOnly: boolean
  send(data: Uint8Array): void
}

interface AwarenessChange {
  added: number[]
  updated: number[]
  removed: number[]
}

/**
 * The live document of one note and everyone connected to it. Changes from one peer are
 * applied to the server's copy and relayed to the others; so is presence.
 */
export class Room {
  readonly doc = new Y.Doc()
  readonly awareness = new Awareness(this.doc)
  /** Each peer with the awareness client ids it announced, to withdraw them when it leaves. */
  private readonly peers = new Map<Peer, Set<number>>()

  constructor() {
    // The server takes part in the document, not in presence.
    this.awareness.setLocalState(null)
    this.doc.on('update', (update: Uint8Array, origin: unknown) => this.broadcast(updateMessage(update), origin))
    this.awareness.on('update', (change: AwarenessChange, origin: unknown) => this.relayAwareness(change, origin))
  }

  get size(): number {
    return this.peers.size
  }

  join(peer: Peer): void {
    this.peers.set(peer, new Set())
    peer.send(syncStep1(this.doc))
    const present = [...this.awareness.getStates().keys()]
    if (present.length > 0) peer.send(awarenessMessage(this.awareness, present))
  }

  /** Applies a message from a peer. Throws when the bytes are not a valid message. */
  receive(peer: Peer, data: Uint8Array): void {
    if (!this.peers.has(peer)) return
    const { reply } = receive(data, this, { origin: peer, readOnly: peer.readOnly })
    if (reply) peer.send(reply)
  }

  leave(peer: Peer): void {
    const announced = this.peers.get(peer)
    if (!announced) return
    this.peers.delete(peer)
    removeAwarenessStates(this.awareness, [...announced], peer)
  }

  destroy(): void {
    this.peers.clear()
    this.awareness.destroy()
    this.doc.destroy()
  }

  private relayAwareness({ added, updated, removed }: AwarenessChange, origin: unknown): void {
    const announced = this.peers.get(origin as Peer)
    if (announced) {
      for (const client of [...added, ...updated]) announced.add(client)
      for (const client of removed) announced.delete(client)
    }
    this.broadcast(awarenessMessage(this.awareness, [...added, ...updated, ...removed]), null)
  }

  /** Sends to every peer except the one the change came from, which already has it. */
  private broadcast(data: Uint8Array, origin: unknown): void {
    for (const peer of this.peers.keys()) {
      if (peer !== origin) peer.send(data)
    }
  }
}
