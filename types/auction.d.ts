interface Bid {
  id: number; // id of bidder
  amount: number; // how much they're bidding
}

interface Lot {
  price: number; // current price of item
  sellerId: number; // id of seller
  highestBidder?: number; // id of current highest bidder, eventually the buyer
  originalPrice: number; // original price at the beginning of the auction
}