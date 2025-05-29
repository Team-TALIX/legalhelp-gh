import Link from "next/link";
import {
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGavel,
  FaHeart,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    legalhelp: {
      title: "LegalHelp GH",
      subtitle: "Know Your Rights, In Your Language",
      links: [],
    },
    resources: {
      title: "Resources",
      links: [
        { label: "Legal Topics", href: "/legal-topics" },
        { label: "Ask Questions", href: "/chat" },
        { label: "Legal Aid", href: "/legal-aid" },
        { label: "Community Stories", href: "/community" },
        { label: "Rights Education", href: "/education" },
      ],
    },
    languages: {
      title: "Languages",
      links: [
        { label: "English", href: "/?lang=en" },
        { label: "Twi", href: "/?lang=twi" },
        { label: "Ewe", href: "/?lang=ewe" },
        { label: "Dagbani", href: "/?lang=dagbani" },
      ],
    },
    about: {
      title: "About",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Help Center", href: "/help" },
      ],
    },
  };

  const socialLinks = [
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <FaGavel className="text-orange-600 dark:text-orange-400 text-2xl mr-2" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {footerSections.legalhelp.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
              {footerSections.legalhelp.subtitle}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6 leading-relaxed">
              Breaking down legal barriers in Ghana through multilingual access
              to legal information, empowering citizens to understand and
              advocate for their rights.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <IconComponent className="text-xl" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {footerSections.resources.title}
            </h4>
            <ul className="space-y-3">
              {footerSections.resources.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {footerSections.languages.title}
            </h4>
            <ul className="space-y-3">
              {footerSections.languages.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {footerSections.about.title}
            </h4>
            <ul className="space-y-3">
              {footerSections.about.links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Stay Updated
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Get the latest legal information and updates delivered to your
              inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <button className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>
                &copy; {currentYear} LegalHelp GH. All rights reserved.
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <FaHeart className="text-red-500 mx-1 text-xs" />
              <span>for Ghana by</span>
              <Link
                href="#"
                className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                Team TALIX
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs text-orange-800 dark:text-orange-200 text-center leading-relaxed">
            <strong>Legal Disclaimer:</strong> The information provided on this
            platform is for educational purposes only and does not constitute
            legal advice. For specific legal matters, please consult with a
            qualified legal professional.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
