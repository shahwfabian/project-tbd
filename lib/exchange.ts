export type Side = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";
export type OrderStatus = "PENDING" | "RESTING" | "PARTIAL" | "FILLED" | "CANCELLED" | "REJECTED";

export type ExchangeConfig = {
  tickSize: number;
  multiplier: number;
  feePerContract: number;
  orderLatency: number;
  cancelLatency: number;
  maxPosition: number;
  maxOrderSize: number;
};
export type Order = { id: number; owner: string; side: Side; type: OrderType; price?: number; quantity: number; remaining: number; submittedAt: number; arrivalAt: number; sequence: number; status: OrderStatus };
export type Fill = { time: number; makerOrderId: number; takerOrderId: number; price: number; quantity: number; maker: string; taker: string; fee: number };
type Event = { time: number; sequence: number; kind: "ARRIVE" | "CANCEL"; orderId: number };

export const defaultExchangeConfig: ExchangeConfig = { tickSize: 0.01, multiplier: 100, feePerContract: 0.25, orderLatency: 1, cancelLatency: 1, maxPosition: 20, maxOrderSize: 10 };
const crossed = (incoming: Order, resting: Order) => incoming.side === "BUY" ? (incoming.type === "MARKET" || (incoming.price ?? -Infinity) >= (resting.price ?? Infinity)) : (incoming.type === "MARKET" || (incoming.price ?? Infinity) <= (resting.price ?? -Infinity));

export class DeterministicExchange {
  readonly config: ExchangeConfig;
  now = 0;
  nextId = 1;
  nextSequence = 1;
  orders = new Map<number, Order>();
  fills: Fill[] = [];
  private events: Event[] = [];
  private bidBook: Order[] = [];
  private askBook: Order[] = [];
  private cashByOwner = new Map<string, number>();
  private positionByOwner = new Map<string, number>();
  private feesByOwner = new Map<string, number>();
  constructor(config: Partial<ExchangeConfig> = {}) { this.config = { ...defaultExchangeConfig, ...config }; }
  submit(owner: string, side: Side, type: OrderType, quantity: number, price?: number) {
    const validPrice = type === "MARKET" || (Number.isFinite(price) && (price as number) > 0 && this.onTick(price as number));
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > this.config.maxOrderSize || !validPrice) return this.rejected(owner, side, type, quantity, price);
    const position = this.positionByOwner.get(owner) ?? 0;
    const workingPosition = position + [...this.orders.values()].filter(o=>o.owner===owner&&["PENDING","RESTING","PARTIAL"].includes(o.status)).reduce((sum,o)=>sum+(o.side === "BUY" ? o.remaining : -o.remaining),0);
    if ((side === "BUY" && workingPosition + quantity > this.config.maxPosition) || (side === "SELL" && workingPosition - quantity < -this.config.maxPosition)) return this.rejected(owner, side, type, quantity, price);
    const order: Order = { id: this.nextId++, owner, side, type, price: type === "LIMIT" ? this.round(price as number) : undefined, quantity, remaining: quantity, submittedAt: this.now, arrivalAt: this.now + this.config.orderLatency, sequence: this.nextSequence++, status: "PENDING" };
    this.orders.set(order.id, order); this.events.push({ time: order.arrivalAt, sequence: order.sequence, kind: "ARRIVE", orderId: order.id }); return order;
  }
  cancel(owner: string, orderId: number) { const order = this.orders.get(orderId); if (!order || order.owner !== owner || !["PENDING", "RESTING", "PARTIAL"].includes(order.status)) return false; this.events.push({ time: this.now + this.config.cancelLatency, sequence: this.nextSequence++, kind: "CANCEL", orderId }); return true; }
  advanceTo(time: number) { if (time < this.now) throw new RangeError("Exchange time cannot move backwards"); while (true) { this.events.sort((a,b)=>a.time-b.time||a.sequence-b.sequence); const event=this.events[0]; if (!event || event.time > time) break; this.events.shift(); this.now=event.time; const order=this.orders.get(event.orderId); if (!order) continue; if (event.kind === "CANCEL") { if (["PENDING","RESTING","PARTIAL"].includes(order.status)) { order.status="CANCELLED"; this.remove(order); } } else if (order.status === "PENDING") this.arrive(order); } this.now=time; }
  book() { return { bid: this.bidBook.filter(o=>o.remaining>0).map(o=>({price:o.price as number,quantity:o.remaining,id:o.id})), ask: this.askBook.filter(o=>o.remaining>0).map(o=>({price:o.price as number,quantity:o.remaining,id:o.id})) }; }
  position(owner: string) { return this.positionByOwner.get(owner) ?? 0; }
  cash(owner: string) { return this.cashByOwner.get(owner) ?? 0; }
  fees(owner: string) { return this.feesByOwner.get(owner) ?? 0; }
  equity(owner: string, markPrice: number) { return this.cash(owner) + this.position(owner) * markPrice * this.config.multiplier; }
  private arrive(order: Order) { order.status="RESTING"; this.match(order); if (order.remaining>0 && order.type === "LIMIT" && !["CANCELLED","REJECTED"].includes(order.status)) { order.status=order.remaining<order.quantity?"PARTIAL":"RESTING"; (order.side === "BUY" ? this.bidBook : this.askBook).push(order); } }
  private match(incoming: Order) { const book=incoming.side === "BUY" ? this.askBook : this.bidBook; book.sort((a,b)=>{const price=(incoming.side === "BUY" ? (a.price as number)-(b.price as number) : (b.price as number)-(a.price as number)); return price||a.sequence-b.sequence;}); for(const resting of [...book]) { if(incoming.remaining<=0 || !crossed(incoming,resting)) break; if(resting.remaining<=0) continue; const quantity=Math.min(incoming.remaining,resting.remaining); this.fill(resting,incoming,quantity,resting.price as number); } if(incoming.remaining<=0) incoming.status="FILLED"; }
  private fill(maker: Order, taker: Order, quantity: number, price: number) { maker.remaining-=quantity; taker.remaining-=quantity; maker.status=maker.remaining===0?"FILLED":"PARTIAL"; taker.status=taker.remaining===0?"FILLED":"PARTIAL"; const fee=quantity*this.config.feePerContract; this.fills.push({time:this.now,makerOrderId:maker.id,takerOrderId:taker.id,price,quantity,maker:maker.owner,taker:taker.owner,fee}); this.account(maker.owner,maker.side === "BUY"?quantity:-quantity, maker.side === "BUY"?-price*quantity*this.config.multiplier:price*quantity*this.config.multiplier, fee); this.account(taker.owner,taker.side === "BUY"?quantity:-quantity, taker.side === "BUY"?-price*quantity*this.config.multiplier:price*quantity*this.config.multiplier, fee); }
  private account(owner: string, positionDelta: number, cashDelta: number, fee: number) { this.positionByOwner.set(owner,this.position(owner)+positionDelta); this.cashByOwner.set(owner,this.cash(owner)+cashDelta-fee); this.feesByOwner.set(owner,this.fees(owner)+fee); }
  private remove(order: Order) { this.bidBook=this.bidBook.filter(o=>o.id!==order.id); this.askBook=this.askBook.filter(o=>o.id!==order.id); }
  private rejected(owner:string,side:Side,type:OrderType,quantity:number,price?:number) { const order:Order={id:this.nextId++,owner,side,type,price,quantity,remaining:quantity,submittedAt:this.now,arrivalAt:this.now,status:"REJECTED",sequence:this.nextSequence++}; this.orders.set(order.id,order); return order; }
  private onTick(price:number) { const ticks=price/this.config.tickSize; return Math.abs(ticks-Math.round(ticks))<1e-8; }
  private round(price:number) { return Math.round(price/this.config.tickSize)*this.config.tickSize; }
}
