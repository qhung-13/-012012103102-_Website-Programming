import { PaymentFormInputs, paymentFormSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Building2, ShoppingCart } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";

const PaymentForm = ({
  onSubmit,
  loading,
}: {
  onSubmit: (data: PaymentFormInputs) => void;
  loading?: boolean;
}) => {
  const { register, handleSubmit } = useForm<PaymentFormInputs>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { paymentMethod: "cod" },
  });
  const handlePaymentForm: SubmitHandler<PaymentFormInputs> = (data) =>
    onSubmit(data);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handlePaymentForm)}
    >
      <p className="text-sm text-muted">
        Chọn cách thanh toán. TRENDLAMA không thu thập thông tin thẻ trên trang
        này.
      </p>
      <label className="flex items-start gap-3 rounded-2xl border border-line p-4 cursor-pointer has-[:checked]:border-ink">
        <input
          type="radio"
          value="cod"
          className="mt-1"
          {...register("paymentMethod")}
        />
        <Banknote className="w-5 h-5 shrink-0" />
        <span>
          <span className="block text-sm font-medium">
            Thanh toán khi nhận hàng
          </span>
          <span className="block text-xs text-muted mt-0.5">
            Thanh toán cho đơn vị giao hàng khi nhận sản phẩm.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 rounded-2xl border border-line p-4 cursor-pointer has-[:checked]:border-ink">
        <input
          type="radio"
          value="bank_transfer"
          className="mt-1"
          {...register("paymentMethod")}
        />
        <Building2 className="w-5 h-5 shrink-0" />
        <span>
          <span className="block text-sm font-medium">
            Chuyển khoản ngân hàng
          </span>
          <span className="block text-xs text-muted mt-0.5">
            Nhân viên sẽ gửi thông tin chuyển khoản sau khi xác nhận đơn.
          </span>
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink hover:bg-gold-dark transition-colors text-paper p-3 rounded-full cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
        <ShoppingCart className="w-3 h-3" />
      </button>
    </form>
  );
};

export default PaymentForm;
