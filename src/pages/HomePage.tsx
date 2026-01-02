import { Link } from "react-router-dom";
import {
  FaBible,
  FaChurch,
  FaUsers,
  FaStore,
  FaHandsHelping,
  FaCalendarAlt,
} from "react-icons/fa";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to Kfarhaoura Brotherhood
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Teaching the Bible to new generations, organizing events for our town,
          and fostering a loving Christian community.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            to="/events"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition"
          >
            <FaCalendarAlt className="inline mr-2" /> Events
          </Link>
          <Link
            to="/shops"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition"
          >
            <FaStore className="inline mr-2" /> Shops
          </Link>
          <Link
            to="/users"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition"
          >
            <FaUsers className="inline mr-2" /> Members
          </Link>
        </div>
        {/* Decorative Icons */}
        <div className="absolute -top-10 left-10 text-white opacity-20 text-6xl rotate-12">
          ✝️
        </div>
        <div className="absolute -bottom-10 right-10 text-white opacity-20 text-6xl rotate-45">
          🕊️
        </div>
        <div className="absolute top-1/2 -left-10 text-white opacity-20 text-6xl rotate-6">
          ✝️
        </div>
      </section>

      {/* About / Mission */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
        <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto">
          We are a Christian brotherhood based in Kfarhaoura, aiming to teach
          the Bible to young generations, organize meaningful events for our
          town, and strengthen the faith and love among our members.
        </p>
      </section>

      {/* Highlights / Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <FaBible className="text-4xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Bible Study</h3>
            <p className="text-gray-700">
              Interactive Bible lessons for new generations to learn and grow in
              faith.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <FaHandsHelping className="text-4xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Community Prayer</h3>
            <p className="text-gray-700">
              Regular prayer meetings for members to connect spiritually and
              strengthen our brotherhood.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <FaChurch className="text-4xl text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Events in Kfarhaoura</h3>
            <p className="text-gray-700">
              Organizing events like Christmas, Easter, and festivals to bring
              the community together.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Contact Us and Join Our Brotherhood
        </h2>
        <p className="mb-8 text-lg md:text-xl max-w-2xl mx-auto">
          Become part of a loving community that teaches the Bible, serves
          others, and celebrates Christian values.
        </p>
        {/*email link*/}
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=kfarhaoura@gmail.com&su=Contact from the Brotherhood Website"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition inline-block"
        >
          Contact Us via Gmail
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        &copy; 2026 Kfarhaoura Brotherhood. All rights reserved.
      </footer>
    </div>
  );
}
