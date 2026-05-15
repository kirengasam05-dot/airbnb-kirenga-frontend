import './SavedListings.css'

import { Transition } from '@headlessui/react'
import { FaHeart, FaLocationDot } from 'react-icons/fa6'

import { useStore } from '../../../store/StoreContext'

export function SavedListings() {
  const { state } = useStore()

  const savedListings = state.listings.filter((listing) =>
    state.saved.includes(listing.id),
  )

  return (
    <Transition
      show={savedListings.length > 0}
      enter="saved-panel-enter"
      enterFrom="saved-panel-from"
      enterTo="saved-panel-to"
      leave="saved-panel-enter"
      leaveFrom="saved-panel-to"
      leaveTo="saved-panel-from"
    >
      <aside className="saved-panel">
        <div className="saved-panel__header">
          <div>
            <p className="saved-panel__eyebrow">Wishlist</p>
            <h3>Saved listings</h3>
          </div>

          <span className="saved-panel__icon">
            <FaHeart />
          </span>
        </div>

        <div className="saved-panel__list">
          {savedListings.slice(0, 3).map((listing) => (
            <article
              key={listing.id}
              className="saved-panel__item"
            >
              <img
                src={listing.img}
                alt={listing.title}
                className="saved-panel__image"
              />

              <div className="saved-panel__content">
                <strong>{listing.title}</strong>

                <span className="saved-panel__location">
                  <FaLocationDot />
                  {listing.location}
                </span>

                <span className="saved-panel__price">
                  ${listing.price}/night
                </span>
              </div>
            </article>
          ))}
        </div>

        {savedListings.length > 3 && (
          <p className="saved-panel__more">
            +{savedListings.length - 3} more saved
          </p>
        )}
      </aside>
    </Transition>
  )
}