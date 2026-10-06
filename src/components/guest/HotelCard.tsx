export interface HotelCardProps {
  name: string
  neighborhood: string
  distance: string
  code: string
  rate: string
  bookBy: string
}

/** A room block written up like a stationery ticket, not a booking-site card. */
export function HotelCard({ name, neighborhood, distance, code, rate, bookBy }: HotelCardProps) {
  return (
    <li className="travel-hotel" data-reveal>
      <div className="travel-hotel__head">
        <h3 className="travel-hotel__name">{name}</h3>
        <span className="travel-hotel__distance">{distance}</span>
      </div>
      <p className="travel-hotel__neighborhood muted">{neighborhood}</p>
      <hr className="rule rule--short" aria-hidden="true" />
      <dl className="travel-hotel__meta">
        <div>
          <dt>Block code</dt>
          <dd className="travel-hotel__code">{code}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd className="tnum">{rate}</dd>
        </div>
        <div>
          <dt>Book by</dt>
          <dd>{bookBy}</dd>
        </div>
      </dl>
    </li>
  )
}

export default HotelCard
