// "use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaComments,
  FaMicrophone,
  FaBook,
  FaGlobe,
  FaBalanceScale,
  FaLightbulb,
  FaUserCircle,
} from "react-icons/fa";

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="relative bg-[#f9f8f2] dark:bg-gray-900 py-24 px-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-[#e17c64] dark:bg-orange-600 opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif text-[#443f39] dark:text-white">
              Know Your Rights, In Your Language
            </h1>
            <p className="text-lg md:text-xl mb-10 text-[#443f39] dark:text-gray-300">
              Breaking down legal barriers in Ghana through multilingual access
              to legal information, empowering citizens to understand and
              advocate for their rights.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link
                href="/chat"
                className="bg-[#e17c64] hover:bg-[#c07162] dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300"
              >
                Ask Legal Questions
              </Link>
              <Link
                href="/legal-topics"
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[#443f39] dark:text-gray-200 border border-[#a99e9a] dark:border-gray-600 font-medium py-3 px-8 rounded-lg transition duration-300"
              >
                Browse Legal Topics
              </Link>
            </div>
          </div>
          <div className="md:w-2/5">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/hero.png"
                alt="Lady Justice statue"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#efc59f] dark:bg-orange-500 opacity-20 translate-x-1/3 translate-y-1/3"></div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon, bgColor, darkBgColor }) => {
  return (
    <div
      className={`${bgColor} ${darkBgColor} p-6 rounded-lg hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center mb-4">
        <div className="text-[#443f39] dark:text-gray-200 mr-3">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2 font-serif text-[#443f39] dark:text-white">
        {title}
      </h3>
      <p className="text-[#443f39] dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      title: "Multilingual Legal Q&A",
      description:
        "Ask legal questions in Twi, Ewe, Dagbani, or English and receive clear, simple answers.",
      icon: <FaComments size={24} />,
      bgColor: "bg-[#f9e3e3]",
      darkBgColor: "dark:bg-red-900/30",
    },
    {
      title: "Voice Interface",
      description:
        "Speak your questions in your native language and listen to explanations through our voice technology.",
      icon: <FaMicrophone size={24} />,
      bgColor: "bg-[#e8f4f8]",
      darkBgColor: "dark:bg-blue-900/30",
    },
    {
      title: "Legal Topic Library",
      description:
        "Access structured information on common legal topics like land rights, tenant rights, and family law.",
      icon: <FaBook size={24} />,
      bgColor: "bg-[#f9f1e8]",
      darkBgColor: "dark:bg-amber-900/30",
    },
    {
      title: "Local Language Support",
      description:
        "Content available in multiple Ghanaian languages, making legal information accessible to everyone.",
      icon: <FaGlobe size={24} />,
      bgColor: "bg-[#e3f9ef]",
      darkBgColor: "dark:bg-green-900/30",
    },
    {
      title: "Legal Aid Directory",
      description:
        "Find pro bono and low-cost legal services near you when you need professional help.",
      icon: <FaBalanceScale size={24} />,
      bgColor: "bg-[#f0e8f8]",
      darkBgColor: "dark:bg-purple-900/30",
    },
    {
      title: "Rights Education",
      description:
        "Learn about your basic legal rights and how to assert them in various situations.",
      icon: <FaLightbulb size={24} />,
      bgColor: "bg-[#f9f8e3]",
      darkBgColor: "dark:bg-yellow-900/30",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4 font-serif text-[#443f39] dark:text-white">
          Legal Assistance in Your Language
        </h2>
        <p className="text-center text-[#443f39] dark:text-gray-300 mb-12 max-w-xl mx-auto">
          Our platform bridges the gap between complex legal systems and
          everyday citizens through accessible multilingual support.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              bgColor={feature.bgColor}
              darkBgColor={feature.darkBgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      title: "Choose Your Language",
      description:
        "Select from Twi, Ewe, Dagbani, or English for all interactions on the platform.",
    },
    {
      number: 2,
      title: "Ask or Browse",
      description:
        "Type or speak your legal question, or browse our organized library of common legal topics.",
    },
    {
      number: 3,
      title: "Get Clear Guidance",
      description:
        "Receive simplified explanations of your rights and next steps in your preferred language.",
    },
  ];

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-6 font-serif text-[#443f39] dark:text-white">
          How LegalHelp GH Works
        </h2>
        <p className="text-center text-[#443f39] dark:text-gray-300 mb-12 max-w-xl mx-auto">
          Accessing legal help in your language is simple and straightforward
        </p>

        <div className="flex flex-col md:flex-row justify-center items-start space-y-10 md:space-y-0 md:space-x-8 lg:space-x-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center max-w-xs"
            >
              <div
                className={`w-16 h-16 flex items-center justify-center rounded-full ${
                  step.number === 1
                    ? "bg-[#e17c64] dark:bg-orange-600"
                    : step.number === 2
                    ? "bg-[#efc59f] dark:bg-amber-600"
                    : "bg-[#748491] dark:bg-gray-600"
                } text-white font-bold text-xl mb-6`}
              >
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3 font-serif text-[#443f39] dark:text-white">
                {step.title}
              </h3>
              <p className="text-[#443f39] dark:text-gray-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Community Impact Stories Section
const CommunityStoriesSection = () => {
  const stories = [
    {
      id: 1,
      content:
        "I was about to be evicted illegally, but thanks to the advice from LegalHelp GH in Twi, I understood my rights as a tenant and could stand up for myself.",
      name: "Kwame Mensah",
      role: "Market Trader, Kumasi",
      initial: "K",
    },
    {
      id: 2,
      content:
        "The voice feature helped me understand my land rights even though I cannot read. I was able to resolve a boundary dispute that had been ongoing for years.",
      name: "Abena Fosuaa",
      role: "Farmer, Volta Region",
      initial: "A",
    },
    {
      id: 3,
      content:
        "As a community advocate, I use LegalHelp GH to explain basic rights to my people in Dagbani. It has changed how we approach legal problems in our village.",
      name: "Mohammed Ibrahim",
      role: "Community Leader, Northern Region",
      initial: "M",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-4 font-serif text-[#443f39] dark:text-white">
          Community Impact Stories
        </h2>
        <p className="text-center text-[#443f39] dark:text-gray-300 mb-12 max-w-xl mx-auto">
          See how LegalHelp GH is empowering Ghanaians to understand and assert
          their legal rights
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-[#443f39] dark:text-gray-200 mb-6">
                {story.content}
              </p>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 ${
                    story.id === 1
                      ? "bg-[#e17c64] dark:bg-orange-600"
                      : story.id === 2
                      ? "bg-[#efc59f] dark:bg-amber-600"
                      : "bg-[#748491] dark:bg-gray-600"
                  }`}
                >
                  {story.initial}
                </div>
                <div>
                  <p className="font-semibold text-[#443f39] dark:text-white">
                    {story.name}
                  </p>
                  <p className="text-sm text-[#a99e9a] dark:text-gray-400">
                    {story.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Call to Action Section
const CallToActionSection = () => {
  return (
    <section className="py-16 bg-[#e17c64] dark:bg-orange-700 text-white">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <h2 className="text-3xl font-bold mb-4 font-serif">
          Access Justice in Your Language Today
        </h2>
        <p className="mb-8 max-w-xl mx-auto">
          Join thousands of Ghanaians who are learning about their rights and
          finding legal solutions in their own language.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="/chat"
            className="bg-white hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-100 text-[#e17c64] dark:text-orange-700 font-medium py-3 px-8 rounded-lg transition duration-300"
          >
            Start a Conversation
          </Link>
          <Link
            href="/legal-aid"
            className="bg-transparent hover:bg-[#c07162] dark:hover:bg-orange-800 text-white border border-white font-medium py-3 px-8 rounded-lg transition duration-300"
          >
            Find Legal Aid
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="theme-transition">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CommunityStoriesSection />
      <CallToActionSection />
    </div>
  );
}
