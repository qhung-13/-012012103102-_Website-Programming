"use client";

import PaymentForm from "@/components/checkout/PaymentForm";
import ShippingForm from "@/components/checkout/ShippingForm";
import useCartStore from "@/stores/cartStore";
import { ShippingFormInputs } from "@/types";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const steps = [
  { id: 1, title: "Shopping Cart" },
  { id: 2, title: "Shipping Address" },
  { id: 3, title: "Payment Method" },
];

const CartPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

  const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart, removeFromCart } = useCartStore();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-8">
      {/* TITLE */}
      <div className="text-center">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          Checkout
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1">
          Your Shopping Cart
        </h1>
      </div>
      {/* STEPS */}
      <div className="flex items-center gap-4 sm:gap-8">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-mono font-medium flex items-center justify-center transition-colors ${
                  step.id === activeStep
                    ? "bg-ink text-paper"
                    : step.id < activeStep
                    ? "bg-gold text-ink"
                    : "bg-paper-dim text-muted"
                }`}
              >
                {step.id}
              </div>
              <p
                className={`text-sm font-medium hidden sm:block ${
                  step.id === activeStep ? "text-ink" : "text-muted"
                }`}
              >
                {step.title}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 sm:w-10 h-px bg-line" />
            )}
          </div>
        ))}
      </div>
      {/* STEPS & DETAILS */}
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* STEPS */}
        <div className="w-full lg:w-7/12 bg-white border border-line p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
          {activeStep === 1 ? (
            cart.length > 0 ? (
              cart.map((item) => (
                // SINGLE CART ITEM
                <div
                  className="flex items-center justify-between gap-4"
                  key={item.id + item.selectedSize + item.selectedColor}
                >
                  {/* IMAGE AND DETAILS */}
                  <div className="flex gap-4 sm:gap-6">
                    {/* IMAGE */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-paper-dim rounded-2xl overflow-hidden shrink-0">
                      <Image
                        src={item.images[item.selectedColor]}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    {/* ITEM DETAILS */}
                    <div className="flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted">
                          Qty {item.quantity} · Size{" "}
                          {item.selectedSize.toUpperCase()} · {item.selectedColor}
                        </p>
                      </div>
                      <p className="font-mono font-medium">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => removeFromCart(item)}
                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 transition-colors text-red-400 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <ShoppingBag className="w-8 h-8 text-muted" />
                <p className="text-sm text-muted">Your cart is empty.</p>
                <Link
                  href="/products"
                  className="text-sm font-medium underline hover:text-gold-dark"
                >
                  Continue shopping
                </Link>
              </div>
            )
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 && shippingForm ? (
            <PaymentForm />
          ) : (
            <p className="text-sm text-muted">
              Please fill in the shipping form to continue.
            </p>
          )}
        </div>
        {/* DETAILS */}
        <div className="w-full lg:w-5/12 bg-white border border-line p-6 sm:p-8 rounded-3xl flex flex-col gap-6 h-max">
          <h2 className="tag-mark font-medium">Order Summary</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <p className="text-muted">Subtotal</p>
              <p className="font-mono font-medium">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted">Discount (10%)</p>
              <p className="font-mono font-medium">$10.00</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted">Shipping Fee</p>
              <p className="font-mono font-medium">$10.00</p>
            </div>
            <div className="h-px bg-line" />
            <div className="flex justify-between items-center">
              <p className="text-ink font-medium">Total</p>
              <p className="font-mono text-lg font-semibold">
                ${subtotal.toFixed(2)}
              </p>
            </div>
          </div>
          {activeStep === 1 && cart.length > 0 && (
            <button
              onClick={() => router.push("/cart?step=2", { scroll: false })}
              className="w-full bg-ink hover:bg-gold-dark transition-colors text-paper p-3 rounded-full cursor-pointer flex items-center justify-center gap-2 text-sm font-medium"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CartPage = () => (
  <Suspense fallback={null}>
    <CartPageContent />
  </Suspense>
);

export default CartPage;
