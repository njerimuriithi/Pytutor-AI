
export const splitLesson = (lessonText) => {
  if (!lessonText) return [];

  return lessonText.split("## ").filter(section => section.trim() !== "");
};

export const getGrade = (scorePercent) => {
  if (scorePercent >= 85) return "Excellent";
  if (scorePercent >= 70) return "Good";
  if (scorePercent >= 50) return "Average";
  return "Weak";
};
export const basicTopics=[
  'Python Introduction',
  'Python Installation',
  'Variables ' ,
  'Data Types',
  'Operators ' ,
  'Expressions',
  'Conditional Statements',
  'Loops'
]
export const InterMediateTopics = [
  'Functions and Modules',
  'Lists, ' ,
  'Tuples, ' ,
  'Dictionaries',
  'File Handling',
  'Error Handling / Exceptions',
  'Object-Oriented Programming'
]
export const advancedTopics = [
  'Decorators and Generators',
  'Lambda ',
  ' Functional Programming',
  'Regular Expressions',
  'Multithreading ',
  ' Concurrency',
  'Working with APIs'
]
export const pythonTopics = [
  'Python Introduction',
  'Python Installation',
  'Variables',
  'Data Types',
  'Type Casting',
  'Operators',
  'Input and Output',
  'Conditional Statements',
  'Loops',
  'Functions',
  'Lambda Functions',
  'Recursion',
  'Strings',
  'Lists',
  'Tuples',
  'Sets',
  'Dictionaries',
  'List Comprehensions',
  'Dictionary Comprehensions',
  'Modules',
  'Packages',
  'Virtual Environments',
  'File Handling',
  'Exception Handling',
  'Object Oriented Programming',
  'Classes and Objects',
  'Inheritance',
  'Polymorphism',
  'Encapsulation',
  'Magic Methods',
  'Iterators',
  'Generators',
  'Decorators',
  'Context Managers',
  'Dataclasses',
  'Enums',
  'Working with Dates and Time',
  'Working with JSON',
  'Working with CSV',
  'Databases',
  'SQLite',
  'SQLAlchemy',
  'APIs',
  'Flask',
  'FastAPI',
  'Authentication',
  'Web Scraping',
  'Automation',
  'Testing',
  'Logging',
  'Debugging',
  'Multithreading',
  'Multiprocessing',
  'Async Programming',
  'Performance Optimization',
  'NumPy',
  'Pandas',
  'Matplotlib',
  'Machine Learning',
  'Scikit-learn',
  'TensorFlow',
  'PyTorch',
  'Natural Language Processing',
  'Deployment',
  'Docker',
  'CI/CD',
  'Packaging Python Projects'
];
