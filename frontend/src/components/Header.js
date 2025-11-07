import React from "react";

const Header = ({ user, credits, loading, signIn, signOut }) => {  // Pricing functionality removed
  if (loading) return null;


  const renderCreditsInfo = () => {
    if (!credits) return null;

    // Show unlimited credits
    return (
      <span className={`text-sm font-medium text-green-600`}>
        ∞ unlimited credits
      </span>
    );
  };
  return (
    <header className="flex items-center justify-between px-4 py-2 min-h-[56px] border-b bg-white text-sm">
      {/* Logo */}
      <div className="flex items-center space-x-2 font-semibold text-gray-900">
        <span className="text-lg">⚡</span>
        <span className="text-base">ResumeQuick</span>
      </div>

      {/* Right side: credits + auth */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-gray-700 truncate max-w-[120px]">{user.displayName}</span>
            <button
              onClick={signOut}
              className="border px-3 py-1 rounded hover:bg-gray-100"
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={signIn}
            className="border px-3 py-1 rounded hover:bg-gray-100"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;