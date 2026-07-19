import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Standard CS Curriculum Topic Dictionary
const TOPIC_DICTIONARY = {
  'DSA': [
    { name: 'Arrays & Strings', priority: 'High' },
    { name: 'Linked Lists & Pointers', priority: 'High' },
    { name: 'Stacks & Queues', priority: 'Medium' },
    { name: 'Trees & Binary Search Trees', priority: 'High' },
    { name: 'Graphs & BFS/DFS', priority: 'High' },
    { name: 'Sorting & Searching Algorithms', priority: 'Medium' },
    { name: 'Recursion & Backtracking', priority: 'High' },
    { name: 'Dynamic Programming Basics', priority: 'High' },
    { name: 'Hashing & HashMaps', priority: 'Medium' },
    { name: 'Heaps & Priority Queues', priority: 'Medium' }
  ],
  'DBMS': [
    { name: 'Entity-Relationship Model & Schema', priority: 'Medium' },
    { name: 'Relational Algebra', priority: 'Medium' },
    { name: 'SQL Queries & Joins', priority: 'High' },
    { name: 'Normalization (1NF, 2NF, 3NF, BCNF)', priority: 'High' },
    { name: 'Transactions & ACID Properties', priority: 'High' },
    { name: 'Concurrency Control & Deadlocks', priority: 'High' },
    { name: 'Indexing & Hashing', priority: 'Medium' }
  ],
  'OS': [
    { name: 'Process & Thread Management', priority: 'Medium' },
    { name: 'CPU Scheduling Algorithms', priority: 'High' },
    { name: 'Process Synchronization & Semaphores', priority: 'High' },
    { name: 'Deadlock Detection & Avoidance', priority: 'High' },
    { name: 'Memory Management & Paging', priority: 'High' },
    { name: 'Virtual Memory & Page Replacement', priority: 'High' },
    { name: 'File Systems & Disk Scheduling', priority: 'Medium' }
  ],
  'CN': [
    { name: 'OSI & TCP/IP Reference Models', priority: 'Medium' },
    { name: 'Physical & Data Link Layers (MAC, ARP)', priority: 'Medium' },
    { name: 'IP Addressing & Subnetting', priority: 'High' },
    { name: 'Routing Protocols (OSPF, BGP)', priority: 'Medium' },
    { name: 'TCP & UDP Transport Protocols', priority: 'High' },
    { name: 'TCP Congestion Control & Flow Control', priority: 'High' },
    { name: 'Application Layer (DNS, HTTP, SMTP)', priority: 'High' }
  ],
  'OOPs': [
    { name: 'Classes, Objects & Constructors', priority: 'Medium' },
    { name: 'Inheritance & Type Casting', priority: 'High' },
    { name: 'Polymorphism (Overloading & Overriding)', priority: 'High' },
    { name: 'Encapsulation & Data Hiding', priority: 'Medium' },
    { name: 'Abstraction & Interface Classes', priority: 'High' },
    { name: 'Exception Handling', priority: 'Medium' }
  ],
  'Aptitude': [
    { name: 'Quantitative Aptitude (Percentages, Ratio)', priority: 'High' },
    { name: 'Quantitative Aptitude (Time, Speed, Work)', priority: 'High' },
    { name: 'Logical Reasoning (Syllogisms, Coding)', priority: 'High' },
    { name: 'Data Interpretation (Charts, Tables)', priority: 'Medium' },
    { name: 'Verbal Ability & Comprehension', priority: 'Medium' }
  ],
  'HISTORY': [
    { name: 'Ancient Civilizations', priority: 'High' },
    { name: 'Medieval History & Empires', priority: 'Medium' },
    { name: 'Modern World History', priority: 'High' },
    { name: 'National Movements & Revolutions', priority: 'High' },
    { name: 'Cold War & Contemporary History', priority: 'Medium' }
  ],
  'BIOLOGY': [
    { name: 'Cell Biology & Genetics', priority: 'High' },
    { name: 'Human Physiology', priority: 'High' },
    { name: 'Plant Physiology', priority: 'Medium' },
    { name: 'Evolution & Ecology', priority: 'Medium' },
    { name: 'Biotechnology & Applications', priority: 'High' }
  ],
  'ACCOUNTING': [
    { name: 'Accounting Principles & Concepts', priority: 'High' },
    { name: 'Journal, Ledger & Trial Balance', priority: 'High' },
    { name: 'Financial Statements (P&L, Balance Sheet)', priority: 'High' },
    { name: 'Cash Flow Statements', priority: 'Medium' },
    { name: 'Costing & Management Accounting', priority: 'Medium' }
  ],
  'PHYSICS': [
    { name: 'Mechanics & Kinematics', priority: 'High' },
    { name: 'Thermodynamics', priority: 'High' },
    { name: 'Electromagnetism', priority: 'High' },
    { name: 'Optics & Waves', priority: 'Medium' },
    { name: 'Modern Physics & Quantum Basics', priority: 'Medium' }
  ],
  'CHEMISTRY': [
    { name: 'Atomic Structure & Chemical Bonding', priority: 'High' },
    { name: 'Thermodynamics & Equilibrium', priority: 'High' },
    { name: 'Organic Chemistry: Basic Principles', priority: 'High' },
    { name: 'Hydrocarbons & Derivatives', priority: 'High' },
    { name: 'Inorganic Chemistry (s, p, d, f blocks)', priority: 'Medium' }
  ],
  'ECONOMICS': [
    { name: 'Microeconomics: Demand & Supply', priority: 'High' },
    { name: 'Macroeconomics: National Income', priority: 'High' },
    { name: 'Money & Banking', priority: 'Medium' },
    { name: 'Government Budget & Economy', priority: 'Medium' },
    { name: 'International Trade', priority: 'Medium' }
  ]
};

// Standard Fallback Topics generator if subject not in list
const generateFallbackTopics = (subject, isWeak) => {
  const defaultPriority = isWeak ? 'High' : 'Medium';
  return [
    { name: `${subject} - Core Fundamentals & Concepts`, priority: defaultPriority },
    { name: `${subject} - Intermediate Theories & Practice`, priority: defaultPriority },
    { name: `${subject} - Advanced Problem Solving`, priority: defaultPriority },
    { name: `${subject} - Revision & Topic Summarization`, priority: defaultPriority },
    { name: `${subject} - Mock Tests & Quiz Assessments`, priority: 'High' }
  ];
};

// Local Algorithmic Scheduler
export const generateAlgorithmicSchedule = (params) => {
  const { examDate, goal, subjects, weakSubjects = [], dailyHours, prepLevel } = params;
  
  const today = new Date();
  const exam = new Date(examDate);
  const diffTime = Math.abs(exam - today);
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  
  // 1. Generate Topics & Priorities
  const plannerTopics = [];
  subjects.forEach(subj => {
    const isWeak = weakSubjects.includes(subj);
    const standardTopics = TOPIC_DICTIONARY[subj] || TOPIC_DICTIONARY[subj.toUpperCase()];
    
    if (standardTopics) {
      standardTopics.forEach(t => {
        plannerTopics.push({
          name: t.name,
          subject: subj,
          isCompleted: false,
          priority: isWeak ? 'High' : t.priority,
        });
      });
    } else {
      generateFallbackTopics(subj, isWeak).forEach(t => {
        plannerTopics.push({
          name: t.name,
          subject: subj,
          isCompleted: false,
          priority: t.priority
        });
      });
    }
  });

  // 2. Generate Revision Dates (Spaced Repetition)
  // Revision 1 -> +1 day, Revision 2 -> +3 days, Revision 3 -> +7 days, Revision 4 -> Exam - 2 days
  const spacedRepetition = [];
  plannerTopics.slice(0, 8).forEach((topic, idx) => {
    const intervals = [
      { num: 1, name: 'Revision 1 (After 1 Day)', offset: 1 },
      { num: 2, name: 'Revision 2 (After 3 Days)', offset: 3 },
      { num: 3, name: 'Revision 3 (After 7 Days)', offset: 7 }
    ];
    
    intervals.forEach(inv => {
      const revDate = new Date();
      revDate.setDate(today.getDate() + inv.offset + idx); // Offset slightly by topic index to distribute load
      if (revDate < exam) {
        spacedRepetition.push({
          revisionNumber: inv.num,
          revisionName: inv.name,
          date: revDate,
          topicName: topic.name,
          subject: topic.subject,
          isCompleted: false
        });
      }
    });
    
    // Add Pre-exam revision
    const preExamDate = new Date(exam);
    preExamDate.setDate(exam.getDate() - 2);
    if (preExamDate > today) {
      spacedRepetition.push({
        revisionNumber: 4,
        revisionName: 'Revision 4 (Pre-Exam)',
        date: preExamDate,
        topicName: topic.name,
        subject: topic.subject,
        isCompleted: false
      });
    }
  });

  // 3. Generate Daily Schedule structure for the next 7 days
  const dailySchedules = [];
  const startHour = 17; // Start studying around 5:00 PM by default
  
  for (let i = 0; i < Math.min(remainingDays, 7); i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + i);
    
    const tasks = [];
    let currentHour = startHour;
    
    // Distribute hours based on subjects
    const mainSubject = weakSubjects.length > 0 
      ? weakSubjects[i % weakSubjects.length] 
      : subjects[i % subjects.length];
    
    const secondarySubject = subjects.filter(s => s !== mainSubject)[i % Math.max(1, subjects.length - 1)] || mainSubject;
    
    // Calculate durations
    const mainHours = Math.max(1, Math.floor(dailyHours * 0.5));
    const secondaryHours = Math.max(1, Math.floor(dailyHours * 0.25));
    const revisionHours = Math.max(0.5, dailyHours - mainHours - secondaryHours);
    
    // Helper to format slots
    const getSlotString = (hourStart, duration) => {
      const formatTime = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 === 0 ? 12 : Math.floor(h % 12);
        const mins = h % 1 === 0 ? '00' : '30';
        return `${formattedHour}:${mins} ${ampm}`;
      };
      return `${formatTime(hourStart)} - ${formatTime(hourStart + duration)}`;
    };

    // Task 1: Main Focus (Core Topic)
    const mainTopicList = plannerTopics.filter(t => t.subject === mainSubject);
    const mainTopic = mainTopicList[i % Math.max(1, mainTopicList.length)]?.name || `${mainSubject} Basics`;
    tasks.push({
      timeSlot: getSlotString(currentHour, mainHours),
      taskName: `Study: ${mainTopic}`,
      subject: mainSubject,
      isCompleted: false,
      durationHours: mainHours
    });
    currentHour += mainHours;

    // Task 2: Secondary Focus
    if (secondaryHours > 0 && secondarySubject !== mainSubject) {
      const secTopicList = plannerTopics.filter(t => t.subject === secondarySubject);
      const secTopic = secTopicList[i % Math.max(1, secTopicList.length)]?.name || `${secondarySubject} Core`;
      tasks.push({
        timeSlot: getSlotString(currentHour, secondaryHours),
        taskName: `Practice: ${secTopic}`,
        subject: secondarySubject,
        isCompleted: false,
        durationHours: secondaryHours
      });
      currentHour += secondaryHours;
    }

    // Task 3: Spaced Revision
    tasks.push({
      timeSlot: getSlotString(currentHour, 0.5),
      taskName: `Revision: Recall Yesterday's topics & Active Recall`,
      subject: mainSubject,
      isCompleted: false,
      durationHours: 0.5
    });
    currentHour += 0.5;

    // Task 4: Quick Assessment Quiz
    if (revisionHours - 0.5 > 0) {
      const testDuration = revisionHours - 0.5;
      tasks.push({
        timeSlot: getSlotString(currentHour, testDuration),
        taskName: `Quiz/Test: Attempt mock questions & solve flashcards`,
        subject: secondarySubject,
        isCompleted: false,
        durationHours: testDuration
      });
    }

    dailySchedules.push({
      date: targetDate,
      tasks,
      isDayCompleted: false,
      studyHoursLogged: 0
    });
  }

  return {
    remainingDays,
    topics: plannerTopics,
    spacedRepetition,
    dailySchedules
  };
};

// AI Gemini Generator
export const generateAISchedule = async (params) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('GEMINI_API_KEY not set. Using hyper-performance local algorithmic scheduler.');
    return generateAlgorithmicSchedule(params);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    // Gemini 2.5 Flash is standard, fast, and great at JSON
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      You are an expert academic coach and schedule planner. Please design a hyper-personalized study schedule for an exam.
      
      User Parameters:
      - Exam Date: ${params.examDate}
      - Daily Available Time: ${params.dailyHours} hours
      - Goal: ${params.goal}
      - Target Subjects: ${params.subjects.join(', ')}
      - Weak Subjects (Need extra focus): ${params.weakSubjects.join(', ')}
      - Preparation Level: ${params.prepLevel}
      
      Please return a JSON object with the exact format structure below. Do not include markdown codeblock tags around the raw JSON. Just return the JSON object directly.
      
      {
        "remainingDays": 30, // number of days until the exam date
        "aiRecommendation": "Your DSA progress is low. Increase DSA study time by 30 mins/day. Priority: 1. Arrays 2. Linked List 3. Trees",
        "topics": [
          {
            "name": "Topic Name",
            "subject": "Subject Name",
            "priority": "High" // "High", "Medium", "Low" based on weakness level and importance
          }
        ],
        "spacedRepetition": [
          {
            "revisionNumber": 1, // 1 (1 day), 2 (3 days), 3 (7 days), 4 (pre-exam)
            "revisionName": "Revision 1 (After 1 Day)",
            "date": "YYYY-MM-DD", // date string
            "topicName": "Topic Name",
            "subject": "Subject Name"
          }
        ],
        "dailySchedules": [
          {
            "date": "YYYY-MM-DD",
            "tasks": [
              {
                "timeSlot": "06:00 PM - 08:00 PM",
                "taskName": "DSA Practice - Arrays",
                "subject": "DSA",
                "durationHours": 2
              }
            ]
          }
        ]
      }

      Requirements:
      1. Divide the daily available study time (${params.dailyHours} hours) logically. Allocate more hours and higher frequency to weak subjects (${params.weakSubjects.join(', ')}).
      2. Set priorities logically based on weakness and relevance.
      3. Design spaced repetitions for the key topics.
      4. Populate dailySchedules for 7 days ahead.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip markdown formatting if Gemini wrapped it in ```json ... ```
    const cleanedText = text
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/, '')
      .trim();
      
    const parsedData = JSON.parse(cleanedText);
    return parsedData;
  } catch (error) {
    console.error('Gemini API Error, falling back to algorithmic schedule:', error);
    return generateAlgorithmicSchedule(params);
  }
};

// AI Performance Recommendations
export const generateAIRecommendations = async (subjectStatusList) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const listDescription = subjectStatusList.map(s => `- ${s.subject}: ${s.completionPercent}% completed, Studied ${s.hoursStudied} hours`).join('\n');
  
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // High-quality rule-based recommendation generator
    const recommendations = [];
    subjectStatusList.forEach(subj => {
      if (subj.completionPercent < 50) {
        recommendations.push({
          subject: subj.subject,
          text: `Your ${subj.subject} completion is currently low (${subj.completionPercent}%). We recommend increasing daily focus on this by 30-45 minutes.`,
          actionable: `Increase ${subj.subject} daily study allocation.`
        });
      } else if (subj.completionPercent >= 50 && subj.completionPercent < 80) {
        recommendations.push({
          subject: subj.subject,
          text: `Good progress on ${subj.subject}! You have unlocked 50%+ of your syllabus. Start taking mini quiz assessments to identify remaining sub-topic gaps.`,
          actionable: `Incorporate daily practice quizzes for ${subj.subject}.`
        });
      } else {
        recommendations.push({
          subject: subj.subject,
          text: `Excellent progress! You have completed ${subj.completionPercent}% of ${subj.subject}. Maintain high-priority active recall and focus on spaced repetitions.`,
          actionable: `Maintain spaced repetitions for ${subj.subject}.`
        });
      }
    });
    return recommendations;
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      You are an expert educational AI analyst. Analyze the following student study progress and make 3 precise, actionable recommendations.
      
      Student Status:
      ${listDescription}
      
      Return a JSON array containing recommendation objects with this exact format:
      [
        {
          "subject": "Subject Name",
          "text": "Your DSA completion is only 45%. Recommendation: Increase DSA study time by 30 minutes daily.",
          "actionable": "Increase DSA study time by 30 minutes daily."
        }
      ]
      
      Do not include markdown tags. Just return raw JSON list.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    const cleanedText = text
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/, '')
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini Recommendation Error, falling back:', error);
    // Algorithmic recommendations fallback
    return subjectStatusList.map(subj => ({
      subject: subj.subject,
      text: `Your ${subj.subject} completion is only ${subj.completionPercent}%. Recommendation: Add 30 minutes of study block to this subject daily.`,
      actionable: `Increase ${subj.subject} study time by 30 minutes daily.`
    }));
  }
};

// ── Static question bank fallback ────────────────────────────────────────────
const STATIC_QUESTION_BANK = {
  DSA: {
    mcqs: [
      { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 'O(log n)' },
      { question: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], answer: 'Stack' },
      { question: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 'O(n²)' },
      { question: 'Which traversal visits root first?', options: ['Inorder', 'Postorder', 'Preorder', 'Level order'], answer: 'Preorder' },
      { question: 'What does BFS use internally?', options: ['Stack', 'Queue', 'Heap', 'Array'], answer: 'Queue' },
      { question: 'Which sorting algorithm is stable and has O(n log n) worst case?', options: ['QuickSort', 'HeapSort', 'MergeSort', 'BubbleSort'], answer: 'MergeSort' },
      { question: 'In a min-heap, the root contains:', options: ['Maximum element', 'Minimum element', 'Middle element', 'Random element'], answer: 'Minimum element' },
      { question: 'Dynamic Programming is based on:', options: ['Divide and Conquer', 'Greedy approach', 'Memoization/Tabulation', 'Backtracking'], answer: 'Memoization/Tabulation' },
      { question: 'A hash table with chaining handles collisions using:', options: ['Open addressing', 'Linked lists', 'Binary trees', 'Arrays only'], answer: 'Linked lists' },
      { question: 'Which graph algorithm finds shortest path in unweighted graph?', options: ['Dijkstra', 'BFS', 'DFS', 'Floyd-Warshall'], answer: 'BFS' },
    ],
    shortQuestions: ['Explain the difference between BFS and DFS with examples.', 'What is dynamic programming? Give a real-world use case.', 'Describe the working of a hash map and how collisions are resolved.', 'What is a balanced BST and why is it important?', 'Compare stack and queue with their applications.'],
    longQuestions: ['Explain the QuickSort algorithm with step-by-step example. Analyze its best, average, and worst-case time complexities.', 'What is graph representation? Explain adjacency matrix vs adjacency list with examples and compare their space and time complexities.'],
  },
  DBMS: {
    mcqs: [
      { question: 'Which normal form eliminates partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: '2NF' },
      { question: 'ACID stands for:', options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'Atomicity, Concurrency, Isolation, Distribution', 'None of above'], answer: 'Atomicity, Consistency, Isolation, Durability' },
      { question: 'Which SQL clause filters grouped results?', options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'], answer: 'HAVING' },
      { question: 'A foreign key references a:', options: ['Primary key in same table', 'Primary key in another table', 'Any column', 'Index'], answer: 'Primary key in another table' },
      { question: 'Which join returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], answer: 'FULL OUTER JOIN' },
      { question: 'Deadlock in DBMS occurs when:', options: ['Two transactions wait for each other indefinitely', 'A query takes too long', 'Index is missing', 'Too many users login'], answer: 'Two transactions wait for each other indefinitely' },
      { question: 'Which index speeds up range queries?', options: ['Hash index', 'B+ tree index', 'Bitmap index', 'Full-text index'], answer: 'B+ tree index' },
      { question: 'Serializability ensures:', options: ['Concurrent transactions appear sequential', 'All data is backed up', 'No transactions fail', 'Locks are released fast'], answer: 'Concurrent transactions appear sequential' },
      { question: 'ER model represents:', options: ['Executable code', 'Entity-relationship diagram', 'Error reports', 'Encryption rules'], answer: 'Entity-relationship diagram' },
      { question: 'Which command removes a table and its structure?', options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'], answer: 'DROP' },
    ],
    shortQuestions: ['What is normalization? Explain 1NF, 2NF, and 3NF with examples.', 'Explain the difference between DELETE, TRUNCATE, and DROP.', 'What is a transaction? Describe the ACID properties.', 'Explain the difference between clustered and non-clustered indexes.', 'What is a deadlock? How can it be prevented in DBMS?'],
    longQuestions: ['Explain the different types of SQL joins (INNER, LEFT, RIGHT, FULL OUTER) with examples and result sets.', 'What is concurrency control? Explain lock-based protocols and timestamp ordering with diagrams.'],
  },
  OS: {
    mcqs: [
      { question: 'Which scheduling algorithm gives minimum average waiting time?', options: ['FCFS', 'SJF', 'Round Robin', 'Priority'], answer: 'SJF' },
      { question: 'A semaphore is used for:', options: ['Memory allocation', 'Process synchronization', 'File management', 'I/O handling'], answer: 'Process synchronization' },
      { question: 'Virtual memory allows:', options: ['Running programs larger than RAM', 'Faster CPU', 'More disk space', 'Better graphics'], answer: 'Running programs larger than RAM' },
      { question: 'Which page replacement policy replaces least recently used page?', options: ['FIFO', 'LRU', 'Optimal', 'Random'], answer: 'LRU' },
      { question: 'A process in the "waiting" state is:', options: ['Executing on CPU', 'Waiting for I/O', 'In ready queue', 'Terminated'], answer: 'Waiting for I/O' },
      { question: 'Deadlock requires which four conditions?', options: ['Mutual exclusion, hold & wait, no preemption, circular wait', 'Starvation, aging, preemption, hold', 'Priority, aging, preemption, wait', 'None of the above'], answer: 'Mutual exclusion, hold & wait, no preemption, circular wait' },
      { question: 'Thrashing occurs when:', options: ['CPU is idle', 'Too much time is spent in paging', 'Memory is empty', 'Disk is full'], answer: 'Too much time is spent in paging' },
      { question: 'Which is NOT a process state?', options: ['Running', 'Ready', 'Sleeping', 'Executing-IO'], answer: 'Executing-IO' },
      { question: 'Banker\'s algorithm is used for:', options: ['Deadlock avoidance', 'Deadlock detection', 'Memory management', 'CPU scheduling'], answer: 'Deadlock avoidance' },
      { question: 'Paging eliminates:', options: ['Internal fragmentation', 'External fragmentation', 'Both', 'Neither'], answer: 'External fragmentation' },
    ],
    shortQuestions: ['What is the difference between process and thread?', 'Explain the various CPU scheduling algorithms briefly.', 'What is a critical section problem? How is it solved?', 'Explain internal vs external fragmentation.', 'What is the purpose of a page table in virtual memory?'],
    longQuestions: ['Explain deadlock in detail — conditions, detection, prevention, and avoidance (Banker\'s algorithm).', 'Compare and contrast paging and segmentation. Which is better and why?'],
  },
  CN: {
    mcqs: [
      { question: 'The OSI model has how many layers?', options: ['5', '6', '7', '4'], answer: '7' },
      { question: 'IP operates at which OSI layer?', options: ['Transport', 'Network', 'Data Link', 'Physical'], answer: 'Network' },
      { question: 'TCP is:', options: ['Connectionless', 'Connection-oriented', 'Stateless', 'Unreliable'], answer: 'Connection-oriented' },
      { question: 'DNS resolves:', options: ['IP to MAC', 'Domain names to IP addresses', 'IP to port', 'URLs to emails'], answer: 'Domain names to IP addresses' },
      { question: 'ARP maps:', options: ['IP to MAC', 'MAC to IP', 'Domain to IP', 'IP to Port'], answer: 'IP to MAC' },
      { question: 'Which protocol is used for email sending?', options: ['IMAP', 'POP3', 'SMTP', 'HTTP'], answer: 'SMTP' },
      { question: 'Subnet mask 255.255.255.0 means:', options: ['24-bit network, 8-bit host', '16-bit network', '8-bit network', '32-bit host'], answer: '24-bit network, 8-bit host' },
      { question: 'HTTP default port is:', options: ['21', '22', '80', '443'], answer: '80' },
      { question: 'UDP is preferred for:', options: ['File transfer', 'Video streaming', 'Email', 'Database queries'], answer: 'Video streaming' },
      { question: 'Which layer handles MAC addresses?', options: ['Network', 'Transport', 'Data Link', 'Physical'], answer: 'Data Link' },
    ],
    shortQuestions: ['Explain the difference between TCP and UDP with use cases.', 'What is subnetting? How is it useful?', 'Describe the 3-way handshake in TCP.', 'What is the role of ARP in networking?', 'Explain the difference between HTTP and HTTPS.'],
    longQuestions: ['Describe the OSI model with all 7 layers, their functions, and examples of protocols at each layer.', 'Explain TCP congestion control mechanisms — slow start, congestion avoidance, fast retransmit, and fast recovery.'],
  },
};

const generateStaticMockTest = (subject) => {
  const key = Object.keys(STATIC_QUESTION_BANK).find(
    k => k.toLowerCase() === subject.toLowerCase() || subject.toLowerCase().includes(k.toLowerCase())
  );
  if (key) return STATIC_QUESTION_BANK[key];

  // Generic fallback for any subject not in the bank
  return {
    mcqs: [
      { question: `What is the primary objective of studying ${subject}?`, options: ['Practical implementation', 'Theoretical research', 'Both A and B', 'None of the above'], answer: 'Both A and B' },
      { question: `Which of the following best describes ${subject}?`, options: ['A scientific discipline', 'A practical skill', 'A theoretical framework', 'All of the above'], answer: 'All of the above' },
      { question: `A core challenge in ${subject} is:`, options: ['Resource optimization', 'Complexity management', 'Scalability', 'All of the above'], answer: 'All of the above' },
      { question: `Problem-solving in ${subject} typically requires:`, options: ['Analytical thinking', 'Memorization only', 'Guessing', 'None'], answer: 'Analytical thinking' },
      { question: `Which approach is most effective when learning ${subject}?`, options: ['Practice problems', 'Reading only', 'Watching videos only', 'Ignoring fundamentals'], answer: 'Practice problems' },
    ],
    shortQuestions: [
      `Explain the fundamental principles of ${subject}.`,
      `What are the key methodologies used in ${subject}?`,
      `Describe a real-world application of ${subject}.`,
      `What are common challenges faced when studying ${subject}?`,
      `How does ${subject} relate to other disciplines you are studying?`,
    ],
    longQuestions: [
      `Critically analyze the recent advancements and future scope in the field of ${subject}. Include practical examples.`,
      `Discuss the core concepts of ${subject} in detail, covering both theoretical and practical aspects.`,
    ],
  };
};

export const generateAIMockTest = async (subject, syllabusText = 'General topics') => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Try Gemini AI first
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
        You are an expert examiner. Generate a rigorous mock test for: ${subject}.
        Base questions on this syllabus:
        ${syllabusText}

        Return ONLY a valid JSON object with this exact structure (no markdown, no backticks):
        {
          "mcqs": [
            { "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A" }
          ],
          "shortQuestions": ["Short question 1", "Short question 2", "Short question 3", "Short question 4", "Short question 5"],
          "longQuestions": ["Long question 1", "Long question 2"]
        }

        Requirements: 10 MCQs, 5 short questions, 2 long questions. Base on the syllabus topics provided.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim()
        .replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(text);
      // Validate structure
      if (parsed.mcqs?.length > 0 && parsed.shortQuestions?.length > 0) {
        return parsed;
      }
      throw new Error('Invalid response structure from Gemini');
    } catch (error) {
      console.error('Gemini mock test failed, using static fallback:', error.message);
    }
  }

  // Static question bank fallback
  console.log(`Using static question bank for: ${subject}`);
  return generateStaticMockTest(subject);
};

// --- AI Service: The Brain of the Application ---
// This file contains all the functions that talk to the Google Gemini AI API.
// Think of this file as the "translator" between our application and the AI.

export const extractSyllabusFromPDF = async (pdfText) => {
  // Removed: AI-powered PDF syllabus extraction is temporarily unavailable.
  throw new Error('Syllabus PDF extraction is currently unavailable.');
};

// This function analyzes Previous Year Questions (PYQ) to find the most important topics.
export const analyzePYQ = async (pdfText) => {
  // Removed: AI-powered PYQ analysis is temporarily unavailable.
  throw new Error('PYQ analysis is currently unavailable.');
};

// This function asks the AI to act like a professor and generate a syllabus from scratch.
export const generateStandardSyllabus = async (subject) => {
  // Removed: AI-powered standard syllabus generation is temporarily unavailable.
  throw new Error('Standard syllabus generation is currently unavailable.');
};

// Generates quick markdown-formatted notes for any given topic.
export const generateShortNotes = async (topic) => {
  // Removed: AI-powered short notes generation is temporarily unavailable.
  throw new Error('Short notes generation is currently unavailable.');
};

// Generates a list of important questions for a specific topic.
export const generateImportantQuestions = async (topic) => {
  // Removed: AI-powered question generation is temporarily unavailable.
  throw new Error('Important questions generation is currently unavailable.');
};
