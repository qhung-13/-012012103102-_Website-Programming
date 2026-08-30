"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { apiFetch, apiFetchAll, ApiError } from "@/lib/api";
import useAuthStore from "@/stores/authStore";

type MessageStatus = "new" | "read" | "resolved";
type SubscriberStatus = "active" | "unsubscribed";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
};

type Subscriber = {
  id: number;
  email: string;
  status: SubscriberStatus;
  created_at: string;
  updated_at: string;
};

const messageStatusLabels: Record<MessageStatus, string> = {
  new: "Mới",
  read: "Đã đọc",
  resolved: "Đã xử lý",
};

const subscriberStatusLabels: Record<SubscriberStatus, string> = {
  active: "Đang nhận tin",
  unsubscribed: "Đã hủy nhận",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
};

export default function MarketingPage() {
  const token = useAuthStore((state) => state.token);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    try {
      const [messageRows, subscriberRows] = await Promise.all([
        apiFetchAll<ContactMessage>("/contact-messages?limit=100", { token }),
        apiFetchAll<Subscriber>("/newsletter-subscribers?limit=100", { token }),
      ]);
      setMessages(messageRows);
      setSubscribers(subscriberRows);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể tải dữ liệu liên hệ.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const updateMessageStatus = async (
    message: ContactMessage,
    status: MessageStatus,
  ) => {
    const previous = messages;
    setMessages((items) =>
      items.map((item) => (item.id === message.id ? { ...item, status } : item)),
    );
    try {
      await apiFetch(`/contact-messages/${message.id}`, {
        method: "PUT",
        token,
        body: { status },
      });
      toast.success("Đã cập nhật trạng thái tin nhắn.");
    } catch (error) {
      setMessages(previous);
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể cập nhật tin nhắn.",
      );
    }
  };

  const deleteMessage = async (message: ContactMessage) => {
    if (!confirm(`Xóa tin nhắn “${message.subject}”?`)) return;
    try {
      await apiFetch(`/contact-messages/${message.id}`, {
        method: "DELETE",
        token,
      });
      setMessages((items) => items.filter((item) => item.id !== message.id));
      toast.success("Đã xóa tin nhắn.");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Không thể xóa tin nhắn.",
      );
    }
  };

  const updateSubscriberStatus = async (
    subscriber: Subscriber,
    status: SubscriberStatus,
  ) => {
    const previous = subscribers;
    setSubscribers((items) =>
      items.map((item) =>
        item.id === subscriber.id ? { ...item, status } : item,
      ),
    );
    try {
      await apiFetch(`/newsletter-subscribers/${subscriber.id}`, {
        method: "PUT",
        token,
        body: { status },
      });
      toast.success("Đã cập nhật người đăng ký.");
    } catch (error) {
      setSubscribers(previous);
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể cập nhật người đăng ký.",
      );
    }
  };

  const deleteSubscriber = async (subscriber: Subscriber) => {
    if (!confirm(`Xóa email “${subscriber.email}” khỏi danh sách?`)) return;
    try {
      await apiFetch(`/newsletter-subscribers/${subscriber.id}`, {
        method: "DELETE",
        token,
      });
      setSubscribers((items) =>
        items.filter((item) => item.id !== subscriber.id),
      );
      toast.success("Đã xóa người đăng ký.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Không thể xóa người đăng ký.",
      );
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Liên hệ & nhận tin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tin nhắn từ khách hàng và danh sách nhận bản tin.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => load(false)}
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Đang tải dữ liệu liên hệ...
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Tin nhắn liên hệ</h2>
              <span className="text-sm text-muted-foreground">
                ({messages.length})
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Người gửi</th>
                    <th className="p-3 text-left">Chủ đề</th>
                    <th className="p-3 text-left">Nội dung</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Thời gian</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Chưa có tin nhắn.
                      </td>
                    </tr>
                  ) : (
                    messages.map((message) => (
                      <tr key={message.id} className="border-t align-top">
                        <td className="p-3">
                          <p className="font-medium">{message.name}</p>
                          <p className="text-xs text-muted-foreground">{message.email}</p>
                        </td>
                        <td className="max-w-52 p-3 font-medium">{message.subject}</td>
                        <td className="max-w-80 p-3 text-muted-foreground">
                          <p className="line-clamp-2">{message.message}</p>
                        </td>
                        <td className="p-3">
                          <select
                            value={message.status}
                            aria-label={`Trạng thái tin nhắn ${message.id}`}
                            onChange={(event) =>
                              updateMessageStatus(
                                message,
                                event.target.value as MessageStatus,
                              )
                            }
                            className="rounded-md border bg-background px-2 py-1 text-xs"
                          >
                            {Object.entries(messageStatusLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                        <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">
                          {formatDate(message.created_at)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Xóa tin nhắn ${message.id}`}
                            onClick={() => deleteMessage(message)}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Danh sách nhận bản tin</h2>
              <span className="text-sm text-muted-foreground">
                ({subscribers.length})
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Trạng thái</th>
                    <th className="p-3 text-left">Ngày đăng ký</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        Chưa có người đăng ký.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-t">
                        <td className="p-3 font-medium">{subscriber.email}</td>
                        <td className="p-3">
                          <select
                            value={subscriber.status}
                            aria-label={`Trạng thái người đăng ký ${subscriber.id}`}
                            onChange={(event) =>
                              updateSubscriberStatus(
                                subscriber,
                                event.target.value as SubscriberStatus,
                              )
                            }
                            className="rounded-md border bg-background px-2 py-1 text-xs"
                          >
                            {Object.entries(subscriberStatusLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </td>
                        <td className="whitespace-nowrap p-3 text-xs text-muted-foreground">
                          {formatDate(subscriber.created_at)}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Xóa người đăng ký ${subscriber.id}`}
                            onClick={() => deleteSubscriber(subscriber)}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
