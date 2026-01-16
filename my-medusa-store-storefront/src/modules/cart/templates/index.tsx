import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="content-container" data-testid="cart-container">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cart?.items?.length ? `${cart.items.length} item(s) in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Cart Items Section */}
            <div className="flex flex-col gap-6">
              {!customer && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                  <SignInPrompt />
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <ItemsTemplate cart={cart} />
              </div>
            </div>

            {/* Summary Section */}
            <div className="relative">
              <div className="sticky top-24">
                {cart && cart.region && (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-3xl">📋</span>
                        Summary
                      </h2>
                    </div>
                    <Summary cart={cart as any} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center">
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
