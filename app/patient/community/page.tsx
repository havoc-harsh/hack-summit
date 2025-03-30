"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiPlus, FiChevronRight, FiLoader } from "react-icons/fi";

interface Request {
  id: string;
  name: string;
  description: string;
  createdAt?: { seconds: number; nanoseconds: number };
  replies: { name: string; message: string }[];
}

export default function CommunityPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: { name: string; message: string } }>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRequests(page);
  }, [page]);

  async function fetchRequests(pageNumber: number) {
    setIsLoading(true);
    const res = await fetch(`/api/community?page=${pageNumber}&limit=10`);
    const data: Request[] = await res.json();
  
    setRequests((prev) => {
      const existingIds = new Set(prev.map((req) => req.id));
      const uniqueNewRequests = data.filter((req) => !existingIds.has(req.id));
      return pageNumber === 1 ? data : [...prev, ...uniqueNewRequests];
    });
  
    setHasMore(data.length === 10);
    setIsLoading(false);
  }

  async function submitRequest() {
    if (!name || !description) return alert("Fill all fields!");

    await fetch("/api/community/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    setPage(1);
    fetchRequests(1);
    setName("");
    setDescription("");
  }

  async function submitReply(requestId: string) {
    const { name: replyName, message: replyMessage } = replyInputs[requestId] || {};
    if (!replyName || !replyMessage) return alert("Fill all fields!");

    await fetch("/api/community/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, name: replyName, message: replyMessage }),
    });

    fetchRequests(1);
    setReplyInputs((prev) => ({ ...prev, [requestId]: { name: "", message: "" } }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-white drop-shadow-lg"
        >
          Community Support Hub
        </motion.h1>

        {/* Submit Request Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
        >
          <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6 text-blue-800">
            <FiPlus className="text-2xl" />
            New Help Request
          </h2>
          <div className="space-y-4">
            <motion.input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            />
            <motion.textarea
              placeholder="Describe your request"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            />
            <motion.button
              onClick={submitRequest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Request
              <FiChevronRight className="text-xl" />
            </motion.button>
          </div>
        </motion.div>

        {/* Requests List */}
        <h2 className="text-3xl font-semibold mb-8 text-white drop-shadow-md">
          Community Requests
        </h2>
        
        <AnimatePresence>
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg mb-6 p-6 border border-white/20"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiMessageSquare className="text-2xl text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{req.name}</h3>
                  <p className="text-gray-600 mt-1">{req.description}</p>
                </div>
              </div>

              {/* Reply Section */}
              <motion.div className="pl-4 border-l-2 border-blue-100 ml-4">
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <motion.input
                    type="text"
                    placeholder="Your Name"
                    value={replyInputs[req.id]?.name || ""}
                    onChange={(e) => setReplyInputs((prev) => ({ ...prev, [req.id]: { ...prev[req.id], name: e.target.value } }))} 
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileHover={{ scale: 1.01 }}
                  />
                  <motion.input
                    type="text"
                    placeholder="Your Message"
                    value={replyInputs[req.id]?.message || ""}
                    onChange={(e) => setReplyInputs((prev) => ({ ...prev, [req.id]: { ...prev[req.id], message: e.target.value } }))}
                    className="flex-2 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileHover={{ scale: 1.01 }}
                  />
                  <motion.button
                    onClick={() => submitReply(req.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reply
                    <FiChevronRight className="text-lg" />
                  </motion.button>
                </div>

                {/* Replies List */}
                <AnimatePresence>
                  {req.replies?.map((reply, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-4 mt-4 pl-4 border-l-2 border-green-100"
                    >
                      <p className="text-gray-600">
                        <span className="font-medium text-green-600">{reply.name}:</span> {reply.message}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && (
          <motion.div className="mt-8 flex justify-center">
            <motion.button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-white/90 hover:bg-white px-8 py-3 rounded-full font-semibold text-blue-600 flex items-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">
                    <FiLoader className="text-xl" />
                  </span>
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <FiChevronRight className="text-xl" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}