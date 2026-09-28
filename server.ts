import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route for Gemini API calls (Floating Chatbot Advisor)
  app.post('/api/chat', async (req: express.Request, res: express.Response) => {
    try {
      const { message, dashboardData, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured on the server. Please add it via Settings > Secrets.' 
        });
      }

      // Initialize Gemini using recommended SDK & options
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct system instruction with student's current live state
      const dashboardContext = dashboardData 
        ? `
[LIVE DASHBOARD STATE]
Student Section: ${dashboardData.sectionName}
Selected "Today's Date" for simulator: ${dashboardData.todayStr}
Selected "Planning Future Date" for simulator: ${dashboardData.preferredFutureDate || 'None'}

SUBJECT ATTENDANCE METRICS:
${dashboardData.subjects.map((s: any) => `
- ${s.subjectName} (${s.subjectCode}):
  * Total Classes in Semester: ${s.totalSemesterClasses}
  * Classes Occurred So Far: ${s.occurredClasses} (Attended: ${s.attendedSoFar}, Missed: ${s.missedSoFar})
  * Current Attendance %: ${s.currentPercentage}%
  * Remaining Classes left in Semester: ${s.remainingClasses}
  * Max Possible Attendance if attending 100% remaining: ${s.maxPossiblePercentage}%
  * Classes they must attend of the remaining to maintain >=75%: ${s.classesToAttendFor75} (Detention is ${s.isImpossible75 ? 'IRREVERSIBLE' : 'Avoidable'})
  * Classes they must attend of the remaining to maintain >=90%: ${s.classesToAttendFor90} (90% is ${s.isImpossible90 ? 'UNREACHABLE' : 'Reachable'})
  * Current Simulator Projected Final Attendance: ${s.finalProjectedPercentage}% (${s.finalProjectedIsDetention ? 'Currently in DETENTION ZONE' : 'SAFE'})
`).join('\n')}

SIMULATED LEAVES / ON-DUTY (OD) ACTIVE:
- Simulated Sick/Medical Leave Days: ${dashboardData.generalLeaves?.join(', ') || 'None'}
- Simulated On-Duty (OD) Days: ${dashboardData.odDays?.join(', ') || 'None'}
- Simulated Excused/Sanctioned Leaves: ${dashboardData.excusedLeaves?.join(', ') || 'None'}

Use the actual student schedules and weekly class rules to compute the math.
For reference, the class section weekly timetables follow standard Monday-Friday schedules (approx 4 classes a day) and a Saturday half-day (2 classes).
Semester started on August 29, 2026 and ends on November 29, 2026.
Holidays when classes are cancelled: September 7 (Labor Day), October 12 (Fall Break), November 11 (Veterans Day), November 26 & 27 (Thanksgiving break).
`
        : 'No student dashboard data loaded yet.';

      const systemInstruction = `
You are the "Attendance Advisor" chatbot, an intelligent, friendly, and highly precise academic counselor for college students.
Your core mission is to help students navigate their attendance rules, schedule future leaves without falling into detention (75%), and reach premium standing (90%).

${dashboardContext}

INSTRUCTIONS FOR CALCULATIONS & PERSONA:
1. Read the student's question, locate their current subject details in the [LIVE DASHBOARD STATE], and perform rigorous mathematical calculations.
2. If the student asks about taking leaves (e.g. "If I take 3 days sick leave starting tomorrow..."), simulate those dates:
   - Identify which weekdays those dates fall on.
   - Count how many classes are scheduled for those subjects on those weekdays based on their timetables.
   - Subtract those classes from their attended count (or add to missed count) and recalculate their final attendance.
   - Alert them clearly if it drops their attendance below 75% (the Detention zone) or 90% (the Honor zone).
3. Do not just make up numbers; use the live dashboard metrics provided. Always provide exact numbers and percentages.
4. Keep your tone encouraging, actionable, and smart, like an experienced student counselor. Use bullet points or bold text to make your calculations easy to scan.
5. Never expose internal system details or say things like "According to the JSON provided...". Speak as though you are viewing their dashboard screen directly.
6. Avoid generic AI-assistant disclaimers. Give direct, solid academic planning advice.
`;

      const contents = [
        ...(history || []).map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      // Call modern Gemini model
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini Advisor Error:', error);
      res.status(500).json({ error: error.message || 'Error occurred calling Gemini Advisor.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    // Fallback index.html route for Vite in SPA mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>VIBECRAFT · Attendance Predictor & Leave Simulator</title>
              <meta name="description" content="College student attendance tracker, On-Duty (OD) simulator, and AI Advisor." />
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static files from built dist folder
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`VIBECRAFT Server running on port ${port}`);
  });
}

startServer();
