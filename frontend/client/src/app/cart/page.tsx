"use client";

import PaymentForm from "@/components/checkout/PaymentForm";
import ShippingForm from "@/components/checkout/ShippingForm";
import useCartStore from "@/stores/cartStore";
import useAuthStore from "@/stores/authStore";
import { apiFetch, ApiError, resolveImageUrl } from "@/lib/api";
import { PaymentFormInputs, ShippingFormInputs } from "@/types";
import { ArrowRight, CheckCircle2, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "react-toastify";
import { formatColor } from "@/lib/localization";
import { loginRedirect } from "@/lib/authRedirect";

const steps = [
  { id: 1, title: "Giỏ hàng" },
  { id: 2, title: "Địa chỉ giao hàng" },
  { id: 3, title: "Thanh toán" },
];

type OrderResult = {
  id: number;
  total: number;
  shipping_email: string;
};

const CartPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const activeStep = Math.min(
    3,
    Math.max(1, parseInt(searchParams.get("step") || "1") || 1),
  );

  const { cart, removeFromCart, clearCart } = useCartStore();
  const { user, token, hasHydrated: authHydrated } = useAuthStore();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal >= 100 ? 0 : 10;
  const estimatedTotal = subtotal - subtotal * 0.1 + shippingFee;

  const handlePlaceOrder = async ({ paymentMethod }: PaymentFormInputs) => {
    if (!shippingForm) return;
    if (!authHydrated || !user || !token) {
      toast.info("Vui lòng đăng nhập trước khi đặt hàng.");
      router.push(loginRedirect("/cart?step=2"));
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await apiFetch<OrderResult>("/orders", {
        method: "POST",
        token,
        body: {
          items: cart.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          shipping: {
            name: shippingForm.name,
            email: shippingForm.email,
            phone: shippingForm.phone,
            address: `${shippingForm.address}, ${shippingForm.city}`,
          },
          payment_method: paymentMethod,
        },
      });
      setOrderResult(res.data);
      clearCart();
      toast.success("Đặt hàng thành công!");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Không thể đặt hàng. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleContinueToShipping = () => {
    if (!authHydrated || !user || !token) {
      toast.info("Vui lòng đăng nhập trước khi thanh toán.");
      router.push(loginRedirect("/cart?step=2"));
      return;
    }
    router.push("/cart?step=2", { scroll: false });
  };

  if (orderResult) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 mt-16 mb-16 text-center max-w-md mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        <h1 className="font-display text-3xl tracking-wide">
          Đặt hàng thành công!
        </h1>
        <p className="text-muted text-sm">
          Cảm ơn bạn đã mua sắm tại Roxbusi. Chúng tôi sẽ liên hệ xác nhận qua{" "}
          <span className="font-medium text-ink">
            {orderResult.shipping_email}
          </span>
          .
        </p>
        <div className="bg-white border border-line rounded-2xl px-6 py-4 w-full flex items-center justify-between">
          <span className="text-sm text-muted">Mã đơn hàng</span>
          <span className="font-mono font-medium">#{orderResult.id}</span>
        </div>
        <div className="bg-white border border-line rounded-2xl px-6 py-4 w-full flex items-center justify-between">
          <span className="text-sm text-muted">Tổng thanh toán</span>
          <span className="font-mono font-medium">
            ${orderResult.total.toFixed(2)}
          </span>
        </div>
        <Link
          href="/products"
          className="mt-2 w-full bg-ink hover:bg-gold-dark transition-colors text-paper p-3 rounded-full flex items-center justify-center gap-2 text-sm font-medium"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-8">
      {/* TITLE */}
      <div className="text-center">
        <span className="tag-mark text-xs uppercase tracking-[0.2em] text-muted font-mono justify-center">
          Thanh toán
        </span>
        <h1 className="font-display text-4xl tracking-wide mt-1">
          Giỏ hàng của bạn
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
                        src={resolveImageUrl(
                          item.images[item.selectedColor] ??
                            (item.imageGallery ?? []).find(
                              (image) => image.color === item.selectedColor,
                            )?.path ??
                            (item.imageGallery ?? [])[0]?.path ??
                            Object.values(item.images)[0],
                        )}
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
                          SL {item.quantity} · Cỡ{" "}
                          {item.selectedSize.toUpperCase()} ·{" "}
                          {formatColor(item.selectedColor)}
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
                    aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 transition-colors text-red-400 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <ShoppingBag className="w-8 h-8 text-muted" />
                <p className="text-sm text-muted">Giỏ hàng đang trống.</p>
                <Link
                  href="/products"
                  className="text-sm font-medium underline hover:text-gold-dark"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            )
          ) : cart.length === 0 ? (
            <p className="text-sm text-muted">
              Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước.
            </p>
          ) : activeStep === 2 && !authHydrated ? (
            <p className="text-sm text-muted">
              Đang kiểm tra phiên đăng nhập...
            </p>
          ) : activeStep === 2 && (!user || !token) ? (
            <div className="flex flex-col gap-3 text-sm text-muted">
              <p>Vui lòng đăng nhập để nhập thông tin giao hàng.</p>
              <Link
                href={loginRedirect("/cart?step=2")}
                className="font-medium text-ink underline hover:text-gold-dark"
              >
                Đăng nhập để tiếp tục
              </Link>
            </div>
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 && shippingForm ? (
            <PaymentForm onSubmit={handlePlaceOrder} loading={placingOrder} />
          ) : (
            <p className="text-sm text-muted">
              Vui lòng nhập thông tin giao hàng để tiếp tục.
            </p>
          )}
        </div>
        {/* DETAILS */}
        <div className="w-full lg:w-5/12 bg-white border border-line p-6 sm:p-8 rounded-3xl flex flex-col gap-6 h-max">
          <h2 className="tag-mark font-medium">Tóm tắt đơn hàng</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <p className="text-muted">Tạm tính</p>
              <p className="font-mono font-medium">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted">Giảm giá (10%)</p>
              <p className="font-mono font-medium">
                -${(subtotal * 0.1).toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-muted">Phí giao hàng</p>
              <p className="font-mono font-medium">
                {shippingFee === 0 ? "Miễn phí" : "$10.00"}
              </p>
            </div>
            <div className="h-px bg-line" />
            <div className="flex justify-between items-center">
              <p className="text-ink font-medium">Tổng cộng</p>
              <p className="font-mono text-lg font-semibold">
                ${estimatedTotal.toFixed(2)}
              </p>
            </div>
          </div>
          {activeStep === 1 && cart.length > 0 && (
            <button
              onClick={handleContinueToShipping}
              className="w-full bg-ink hover:bg-gold-dark transition-colors text-paper p-3 rounded-full cursor-pointer flex items-center justify-center gap-2 text-sm font-medium"
            >
              Tiếp tục
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
