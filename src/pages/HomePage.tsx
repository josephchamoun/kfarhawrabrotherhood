import { Link } from "react-router-dom";
import {
  FaBible,
  FaChurch,
  FaUsers,
  FaStore,
  FaHandsHelping,
  FaCalendarAlt,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import api from "../api/api";
import type { Stats } from "../types";
import MainLogo from "../assets/mainlogo.jpg";

export default function HomePage() {
  const FOUNDATION_YEAR = 2026;
  const yearsOfService = Math.max(
    new Date().getFullYear() - FOUNDATION_YEAR,
    0,
  );

  const [animatedStats, setAnimatedStats] = useState<Stats>({
    total_users: 0,
    total_events: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats");
        animateNumbers(res.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const animateNumbers = (target: Stats) => {
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setAnimatedStats({
        total_users: Math.floor(progress * target.total_users),
        total_events: Math.floor(progress * target.total_events),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-32 px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        {/* Decorative crosses */}
        <div className="absolute top-10 left-10 text-white/10 text-8xl transform -rotate-12 hidden md:block">
          ✝
        </div>
        <div className="absolute bottom-10 right-10 text-white/10 text-8xl transform rotate-12 hidden md:block">
          ✝
        </div>
        <div className="absolute top-1/3 right-20 text-white/10 text-6xl transform rotate-45 hidden lg:block">
          🕊
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 overflow-hidden">
              <img
                src={MainLogo}
                alt="Main Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Welcome to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
              Kfarhaoura Brotherhood
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-blue-100 leading-relaxed">
            Teaching the Bible to new generations, organizing events for our
            town, and fostering a loving Christian community in Lebanon.
          </p>

          <div className="flex flex-col items-center gap-6">
            {/* Main navigation buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/events"
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3"
              >
                <FaCalendarAlt className="text-xl group-hover:rotate-12 transition-transform" />
                <span>Events</span>
              </Link>

              <Link
                to="/shops"
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3"
              >
                <FaStore className="text-xl group-hover:rotate-12 transition-transform" />
                <span>Shops</span>
              </Link>

              <Link
                to="/users"
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center gap-3"
              >
                <FaUsers className="text-xl group-hover:rotate-12 transition-transform" />
                <span>Members</span>
              </Link>
            </div>

            {/* Login button centered alone */}
            <Link
              to="/login"
              className="group bg-transparent border-2 border-white text-white px-10 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-900 transition-all transform hover:scale-105 flex items-center gap-3"
            >
              <span>Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* About / Mission */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-blue-600 text-sm font-bold uppercase tracking-wider bg-blue-50 px-4 py-2 rounded-full">
              Our Mission
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Building Faith, Community & Love
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            We are a Christian brotherhood based in Kfarhaoura, Lebanon,
            dedicated to teaching the Bible to young generations, organizing
            meaningful events for our town, and strengthening the faith and love
            among our members.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {/* Total Members */}
          <div className="text-center p-6">
            {loadingStats ? (
              <div className="h-14 w-32 mx-auto bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                {animatedStats.total_users}
              </div>
            )}
            <p className="text-gray-600 font-medium">Total Members</p>
          </div>

          {/* Events */}
          <div className="text-center p-6">
            {loadingStats ? (
              <div className="h-14 w-32 mx-auto bg-gray-200 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                {animatedStats.total_events}
              </div>
            )}
            <p className="text-gray-600 font-medium">Events Organized</p>
          </div>

          {/* Static Metric */}
          <div className="text-center p-6">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              {yearsOfService < 1 ? "Since 2026" : `${yearsOfService}`}
            </div>
            <p className="text-gray-600 font-medium">Years of Service</p>
          </div>
        </div>
      </section>

      {/* Highlights / Features */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="cross-pattern-features"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M40 15 L40 65 M15 40 L65 40"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#cross-pattern-features)"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-blue-600 text-sm font-bold uppercase tracking-wider bg-blue-50 px-4 py-2 rounded-full">
                What We Do
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Core Activities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-blue-600">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaBible className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Bible Study
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Interactive Bible lessons for new generations to learn and grow
                in faith through engaging discussions and teachings.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-indigo-600">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaHandsHelping className="text-3xl text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Community Prayer
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Regular prayer meetings for members to connect spiritually and
                strengthen our brotherhood through worship and fellowship.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-t-4 border-purple-600">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaChurch className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">
                Community Events
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Organizing events like Christmas, Easter, and festivals to bring
                the community together in celebration and faith.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 px-6 text-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Join Our Brotherhood
          </h2>
          <p className="mb-10 text-xl md:text-2xl max-w-2xl mx-auto text-blue-100 leading-relaxed">
            Become part of a loving community that teaches the Bible, serves
            others, and celebrates Christian values together.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto mb-10">
            <p className="text-lg italic text-blue-100 leading-relaxed mb-4">
              "For where two or three gather in my name,
              <br />
              there am I with them."
            </p>
            <p className="text-sm text-blue-200 font-semibold">
              — Matthew 18:20
            </p>
          </div>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=kfarhaoura@gmail.com&su=Contact from the Brotherhood Website"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-white text-blue-900 px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 hover:-translate-y-1"
          >
            <svg
              className="w-6 h-6 group-hover:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>Contact Us via Gmail</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={MainLogo}
                    alt="Icon"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xl font-bold">
                  Kfarhaoura Brotherhood
                </span>
              </div>

              <p className="text-gray-400 text-sm">
                Building faith and community in Lebanon
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                &copy; 2026 Kfarhaoura Brotherhood. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
