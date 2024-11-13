import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomeView from "./Views/HomeView";
import AdminView from "./Views/AdminView";
import ContentView from "./Views/ContentView";
import LoginView from "./Views/LoginView";
import "./App.css";
import ProtectedRoute from "./Hooks/ProtectedRoute";
import { AuthProvider } from "./Contexts/authContext";
import SearchResultPage from "./Views/SearchResultPage";
import UploadContentView from "./Views/UploadContentView";
import UpdateContentView from "./Views/UpdateContentView";
import AllContentView from "./Views/AllContentView";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="">
          <Routes>
            <Route path="/" element={<HomeView />} />

            <Route path="/content" element={<ContentView />} />

            <Route
              path="/content"
              element={<Navigate to="/content" replace />}
            />

            <Route path="/category/:id" element={<HomeView />} />
            <Route path="/videos" element={<AllContentView />} />

            <Route path="/search" element={<SearchResultPage />} />

            <Route path="/login" element={<LoginView />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/video/upload"
              element={
                <ProtectedRoute>
                  <UploadContentView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/video/edit/:videoId"
              element={
                <ProtectedRoute>
                  <UpdateContentView />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                    <p className="text-gray-400 mb-6">Page not found</p>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Return to Home
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
