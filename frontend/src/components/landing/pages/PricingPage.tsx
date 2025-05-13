import React from "react";

const PricingPage: React.FC = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 py-16 px-4 md:px-16 ">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold dark:text-gray-100 text-gray-800">
          Our Pricing Plans
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Choose the plan that suits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Basic Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ideal for individuals.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ideal for individuals.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ideal for individuals.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ideal for individuals.
          </p>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            $19/month
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
            Get Started
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Professional Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Perfect for teams.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Perfect for teams.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Perfect for teams.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Perfect for teams.
          </p>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            $49/month
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
            Get Started
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 h-max">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Enterprise Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            For large businesses.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            For large businesses.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            For large businesses. 
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            For large businesses. 
          </p>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
            $99/month
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
