import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Send, MessageSquare, X, Loader2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const EmergencyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
       "👋 Hello! I'm your emergency medical assistant. I can help guide you through first-aid procedures. What emergency situation are you dealing with?\n\n⚠️ For life-threatening emergencies, please call 911 immediately."
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // ✅ Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v4/message",
        { message: input },
        { withCredentials: true }
      );

      const botReply =
        res.data.reply ||
        "⚠️ Sorry, I couldn’t process that. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Unable to connect to chatbot.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Server error. Please try again later or contact the hospital directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-red-600 text-white p-4 shadow-lg hover:bg-red-700"
        >
          <MessageSquare className="h-6 w-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] z-50"
          >
            <Card className="w-full h-full flex flex-col shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-red-50 border-b flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-red-100">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-800">
                    Emergency Assistant
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 hover:bg-red-100"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </CardHeader>

 <CardContent className="flex-1 p-0 flex flex-col overflow-y-scroll">
  {/* Chat area with scroll */}
  <div
    ref={scrollRef}
    className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
  >
    {messages.map((msg, idx) => (
      <div
        key={idx}
        className={`flex ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
            msg.role === "user"
              ? "bg-emergency text-white"
              : "bg-muted"
          }`}
        >
          {msg.content}
        </div>
      </div>
    ))}

    {isLoading && (
      <div className="flex justify-start">
        <div className="bg-muted rounded-lg p-3">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    )}
  </div>

  {/* Input fixed at bottom */}
  <div className="p-4 border-t bg-background shrink-0">
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Describe the emergency..."
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        onClick={sendMessage}
        disabled={!input.trim() || isLoading}
        variant="emergency"
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
    <p className="text-xs text-muted-foreground mt-2 text-center">
      AI guidance only • Call 911 for emergencies
    </p>
  </div>
</CardContent>


            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencyChatbot;
