import assert from 'assert'
import { Contract } from './contract.js'
import { OpLog } from './log.js'

export interface VerifyInclusionProofOpts {
  contract?: Contract
  oplog?: OpLog
}

export async function verifyInclusionProof (proof: object|BlockInclusionProof, opts?: VerifyInclusionProofOpts) {
  const p: BlockInclusionProof = proof instanceof BlockInclusionProof ? proof : BlockInclusionProof.fromJSON(proof)
  let oplog: OpLog|undefined
  if (opts?.oplog && opts.oplog.pubkey.equals(p.logPubkey)) {
    oplog = opts.oplog
  } else if (opts?.contract && opts.contract.isOplogParticipant(p.logPubkey)) {
    oplog = opts.contract.getParticipant(p.logPubkey) as OpLog
  } else {
    throw new Error('TODO: fetch oplog from network')
  }
  await oplog.verifyBlockInclusionProof(p)
}

export class BlockInclusionProof {
  constructor (public logPubkey: Buffer, public blockSeq: number, public rootHashAtBlock: Buffer, public rootHashSignature: Buffer) {
  }

  toJSON () {
    return {
      itoBlockInclusionProof: 1,
      logPubkey: this.logPubkey.toString('hex'), 
      blockSeq: this.blockSeq, 
      rootHashAtBlock: this.rootHashAtBlock.toString('hex'), 
      rootHashSignature: this.rootHashSignature.toString('hex')
    }
  }

  static fromJSON (obj: any): BlockInclusionProof {
    assert(obj.itoBlockInclusionProof >= 1, 'Invalid schema version')
    assert(typeof obj.logPubkey === 'string' && obj.logPubkey.length === 64, 'Invalid logPubkey')
    assert(typeof obj.blockSeq === 'number', 'Invalid blockSeq')
    assert(typeof obj.rootHashAtBlock === 'string', 'Invalid rootHashAtBlock')
    assert(typeof obj.rootHashSignature === 'string', 'Invalid rootHashSignature')
    return new BlockInclusionProof(
      Buffer.from(obj.logPubkey, 'hex'),
      obj.blockSeq,
      Buffer.from(obj.rootHashAtBlock, 'hex'),
      Buffer.from(obj.rootHashSignature, 'hex')
    )
  }
}