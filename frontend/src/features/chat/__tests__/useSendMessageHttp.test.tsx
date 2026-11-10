import { createElement, type ReactNode } from "react"
import { act, renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { useSendMessage } from "../useSendMessage"
import { clientMessageId } from "../clientMessageId"

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }))
vi.mock("@/lib/notify", () => ({ notifyError: vi.fn() }))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("sending over a local HTTP URL", () => {
  it("uses the native UUID on secure origins", () => {
    const randomUUID = vi.fn(() => "native-uuid")
    vi.stubGlobal("crypto", { randomUUID })
    expect(clientMessageId()).toBe("native-uuid")
  })

  it("reaches the message API when randomUUID is unavailable", async () => {
    vi.stubGlobal("crypto", {
      getRandomValues: (bytes: Uint8Array) => bytes.fill(0),
    })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)
    queryClient.setQueryData(["device", "self-info"], { name: "Heitor" })
    vi.mocked(api.post).mockImplementation(async () => {
      const cache = queryClient.getQueryData<{pages: {items: {text: string}[]}[]}>(["messages", "chan:1"])
      expect(cache?.pages[0].items[0].text).toBe("local HTTP test")
      return { id: 1 }
    })
    const { result, unmount } = renderHook(() => useSendMessage(), { wrapper })
    try {
      expect(clientMessageId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
      await act(async () => {
        await result.current.mutateAsync({ channelIdx: 1, text: "local HTTP test" })
      })
      expect(api.post).toHaveBeenCalledWith("/api/messages", {
        contact_pub_key: undefined, channel_idx: 1, text: "local HTTP test",
      })
    } finally {
      unmount()
      queryClient.clear()
    }
  })
})
