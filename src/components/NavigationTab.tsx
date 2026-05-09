import { useState } from "react";
import { Menu, X, MessageSquare, Home } from "lucide-react";
import { Doodle } from "./parts";

type View = "main" | "comments";

export function NavigationTab({ currentView, onViewChange }: { 
  currentView: View; 
  onViewChange: (view: View) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navigation Tab */}
      <div className="fixed top-1/2 left-4 -translate-y-1/2 z-[50]">
        <button
          onClick={() => {
            if (currentView === "comments") {
              onViewChange("main");
            } else {
              onViewChange("comments");
            }
          }}
          className={`paper p-3 shadow-lg hover:scale-110 transition-transform ${
            currentView === "comments" ? "palette-accent-bg" : ""
          }`}
          title={currentView === "comments" ? "back to main" : "comments"}
        >
          {currentView === "comments" ? <Home size={20} /> : <span className="text-xl font-bold">+</span>}
        </button>
      </div>

      {/* Side Panel */}
      <div className={`fixed top-0 left-0 h-full w-80 palette-surface-strong shadow-2xl z-[40] transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="paper-text text-2xl" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              navigation
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="paper p-2 hover:scale-110 transition-transform"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Options */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onViewChange("main");
                setIsOpen(false);
              }}
              className={`w-full paper p-4 text-left transition-all hover:scale-[1.02] ${
                currentView === "main" ? "palette-accent-bg" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Home size={18} />
                <div>
                  <div className="font-bold paper-text">main page</div>
                  <div className="text-sm paper-text-muted">about, favorites, projects</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                onViewChange("comments");
                setIsOpen(false);
              }}
              className={`w-full paper p-4 text-left transition-all hover:scale-[1.02] ${
                currentView === "comments" ? "palette-accent-bg" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                <div>
                  <div className="font-bold paper-text">comments</div>
                  <div className="text-sm paper-text-muted">leave a message</div>
                </div>
              </div>
            </button>
          </div>

          {/* Decorative Doodles */}
          <Doodle kind="star" top="20%" left="85%" size={24} rotate={15} />
          <Doodle kind="swirl" top="75%" left="80%" size={32} rotate={-20} />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[30]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
