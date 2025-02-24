import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, RefreshCw, Info, ChevronRight, ChevronLeft } from 'lucide-react';

interface ArrayElementProps {
  value: number;
  index: number;
  isMid: boolean;
  isActive: boolean;
  isTarget: boolean;
  isInRange: boolean;
  currentStep: {
    left: number;
    right: number;
    mid: number;
    found: boolean;
    comparison?: 'equal' | 'smaller' | 'larger';
  } | null;
}

const ArrayElement: React.FC<ArrayElementProps> = ({ value, index, isMid, isActive, isTarget, isInRange, currentStep }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-sm text-gray-500 font-mono mb-1">
        {index}
      </div>
      <div className="h-6 flex items-center justify-center">
        {currentStep && (
          <>
            {index === currentStep.left && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-blue-600"
              >
                start
              </motion.div>
            )}
            {index === currentStep.mid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-yellow-600"
              >
                mid
              </motion.div>
            )}
            {index === currentStep.right && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-blue-600"
              >
                end
              </motion.div>
            )}
          </>
        )}
      </div>
      <motion.div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-mono relative
          ${isInRange ? 'bg-blue-100 border-blue-200' : 'bg-gray-100 border-gray-200'}
          ${isMid ? 'bg-yellow-100 border-yellow-300' : ''}
          ${isTarget ? 'bg-green-100 border-green-300' : ''}
          border-2 transition-colors duration-300`}
      >
        {value}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-blue-500"
            initial={false}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>
    </div>
  );
};

function App() {
  const [arrayInput, setArrayInput] = useState("0,2,4,6,8,10,12,14,16,18,20,22,24,26,28");
  const [array, setArray] = useState<number[]>(() => 
    arrayInput.split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b)
  );
  const [target, setTarget] = useState(14);
  const [currentStep, setCurrentStep] = useState<{
    left: number;
    right: number;
    mid: number;
    found: boolean;
    comparison?: 'equal' | 'smaller' | 'larger';
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [stepDescription, setStepDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resetSearch = () => {
    setCurrentStep(null);
    setIsSearching(false);
    setStepDescription('');
    setError('');
  };

  const handleArrayInput = (input: string) => {
    setArrayInput(input);
    const numbers = input.split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    if (numbers.length === 0) {
      setError('Please enter valid numbers separated by commas');
      return;
    }
    
    setArray(numbers);
    setError('');
    resetSearch();
  };

  const updateStepDescription = (step: typeof currentStep, comparison?: 'equal' | 'smaller' | 'larger') => {
    if (!step) return;
    
    const { left, right, mid } = step;
    const midValue = array[mid];
    
    let description = '';
    
    if (comparison === undefined) {
      description = `Searching between indices ${left} and ${right}`;
      description += `\nChecking middle element (${midValue}) at position ${mid}`;
    } else if (comparison === 'equal') {
      description = `🎉 Found ${target} at position ${mid}!`;
    } else if (comparison === 'smaller') {
      description = `${midValue} is too small, target ${target} must be in the right half`;
    } else {
      description = `${midValue} is too large, target ${target} must be in the left half`;
    }
    
    setStepDescription(description);
  };

  const startSearch = async () => {
    if (array.length === 0) {
      setError('Please enter valid numbers separated by commas');
      return;
    }

    if (target < array[0] || target > array[array.length - 1]) {
      setError(`Target ${target} is outside the range of the array (${array[0]} to ${array[array.length - 1]})`);
      return;
    }

    setError('');
    setIsSearching(true);
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const step = { left, right, mid, found: false };
      setCurrentStep(step);
      updateStepDescription(step);
      await sleep(7000);

      if (array[mid] === target) {
        const finalStep = { ...step, found: true, comparison: 'equal' as const };
        setCurrentStep(finalStep);
        updateStepDescription(finalStep, 'equal');
        return;
      }

      if (array[mid] < target) {
        const stepWithComparison = { ...step, comparison: 'smaller' as const };
        setCurrentStep(stepWithComparison);
        updateStepDescription(stepWithComparison, 'smaller');
        await sleep(7000);
        left = mid + 1;
      } else {
        const stepWithComparison = { ...step, comparison: 'larger' as const };
        setCurrentStep(stepWithComparison);
        updateStepDescription(stepWithComparison, 'larger');
        await sleep(5000);
        right = mid - 1;
      }
    }

    setCurrentStep({ left: -1, right: -1, mid: -1, found: false });
    setStepDescription(`😕 Target ${target} not found in the array`);
  };

  const MoreInfoModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 mt-2 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowMoreInfo(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-blue-800">Binary Search Explained</h2>
          
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">What is Binary Search?</h3>
              <p className="text-gray-700">
                Binary search is an efficient algorithm for finding a target value within a sorted array. 
                It works by repeatedly dividing the search interval in half, making it much faster than 
                checking each element one by one.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Time Complexity</h3>
              <p className="text-gray-700">
                Binary Search has a time complexity of O(log n), where n is the size of the array. 
                This means it's very efficient even for large datasets. For example, in an array of 
                1 million elements, it would take at most 20 steps to find any element.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Key Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>The array must be sorted</li>
                <li>Random access to elements (array-like data structure)</li>
                <li>Clear ordering relationship between elements</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Common Applications</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Finding elements in sorted arrays</li>
                <li>Dictionary lookups</li>
                <li>Database indexing</li>
                <li>Finding insertion points in sorted data</li>
              </ul>
            </section>
          </div>

          <button
            onClick={() => setShowMoreInfo(false)}
            className="mt-9 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Binary Search Visualizer
            </h1>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-full hover:bg-blue-100 transition-colors"
              title="Show/Hide Info"
            >
              <Info size={24} className="text-blue-600" />
            </button>
          </div>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">
                    <Search size={24} className="text-blue-600" />
                    How Binary Search Works
                  </h2>
                  <ol className="list-decimal list-inside space-y-3 text-blue-900">
                    <li className="transition-colors hover:text-blue-600">
                      The array must be sorted (numbers are automatically sorted)
                    </li>
                    <li className="transition-colors hover:text-blue-600">
                      Find the middle element and compare it with the target
                    </li>
                    <li className="transition-colors hover:text-blue-600">
                      If the middle element is the target, we're done!
                    </li>
                    <li className="transition-colors hover:text-blue-600">
                      If the target is smaller, search the left half
                    </li>
                    <li className="transition-colors hover:text-blue-600">
                      If the target is larger, search the right half
                    </li>
                    <li className="transition-colors hover:text-blue-600">
                      Repeat until the target is found or the search range is empty
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Enter Numbers (comma-separated)
                </label>
                <input
                  type="text"
                  value={arrayInput}
                  onChange={(e) => handleArrayInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="e.g., 1,3,5,7,9,11"
                  disabled={isSearching}
                />
                <p className="text-sm text-gray-500">
                  Numbers will be automatically sorted in ascending order
                </p>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Number
                  </label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => {
                      setTarget(Number(e.target.value));
                      resetSearch();
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    disabled={isSearching}
                  />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={startSearch}
                    disabled={isSearching || array.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play size={20} />
                    Start
                  </motion.button>
                  <motion.button
                    onClick={resetSearch}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw size={20} />
                    Reset
                  </motion.button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl p-8 min-h-[300px]">
              <div className="flex justify-center mb-16">
                {array.map((num, index) => (
                  <ArrayElement
                    key={index}
                    value={num}
                    index={index}
                    isMid={currentStep?.mid === index}
                    isActive={currentStep?.mid === index}
                    isTarget={currentStep?.found && currentStep?.mid === index}
                    isInRange={
                      currentStep
                        ? index >= currentStep.left && index <= currentStep.right
                        : true
                    }
                    currentStep={currentStep}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {stepDescription && (
                  <motion.div
                    key={stepDescription}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute left-0 right-0 -bottom-15 flex justify-center"
                  >
                    <div className="inline-block bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-xl border border-blue-100">
                      <pre className="text-lg text-gray-700 whitespace-pre-wrap font-mono">
                        {stepDescription}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-[-10px] left-0 right-0 flex flex-col items-center gap-3">
                <button
                  onClick={() => setShowMoreInfo(true)}
                  className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-blue-100 
                             text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Info size={16} />
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMoreInfo && <MoreInfoModal />}
      </AnimatePresence>
    </div>
  );
}

export default App;