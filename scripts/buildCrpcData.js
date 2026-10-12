/**
 * Generator script to create complete 1 to 565 sections of The Code of Criminal Procedure, 1898
 * in Bengali with full legal titles, authentic contents, landmarks, and repeal statuses.
 */
const fs = require('fs');
const path = require('path');

function toBn(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

// Read the current crpcFullLaw.ts to extract existing rich sections so we don't lose any detailed work!
let existingSectionsMap = new Map();
try {
  const currentCrpcPath = path.resolve(__dirname, '../src/data/crpcFullLaw.ts');
  const fileContent = fs.readFileSync(currentCrpcPath, 'utf8');
  
  // Regex to extract section blocks
  const secRegex = /\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?sectionNumber:\s*['"]([^'"]+)['"][\s\S]*?sectionNumberBengali:\s*['"]([^'"]+)['"][\s\S]*?titleBengali:\s*['"]([^'"]+)['"][\s\S]*?titleEnglish:\s*['"]([^'"]+)['"][\s\S]*?contentBengali:\s*([\s\S]*?),\s*(?:penaltySummaryBengali:[\s\S]*?,)?\s*isLandmark:\s*(true|false)[\s\S]*?\}/g;
  
  // We can also extract more safely using a regex for section blocks
  const blockRegex = /\{\s*id:\s*['"](crpc-sec-[^'"]+)['"][\s\S]*?isLandmark:\s*(true|false)[\s\S]*?\}/g;
  let match;
  while ((match = blockRegex.exec(fileContent)) !== null) {
    const rawBlock = match[0];
    const idMatch = rawBlock.match(/id:\s*['"]([^'"]+)['"]/);
    const numMatch = rawBlock.match(/sectionNumber:\s*['"]([^'"]+)['"]/);
    const bnNumMatch = rawBlock.match(/sectionNumberBengali:\s*['"]([^'"]+)['"]/);
    const titleBnMatch = rawBlock.match(/titleBengali:\s*['"]([^'"]+)['"]/);
    const titleEnMatch = rawBlock.match(/titleEnglish:\s*['"]([^'"]+)['"]/);
    
    // contentBengali could be multiline string with quotes or template literal
    let contentBn = '';
    const contentMatch = rawBlock.match(/contentBengali:\s*(['"`])([\s\S]*?)\1\s*,\s*(?:penaltySummaryBengali|isLandmark|bailable)/);
    if (contentMatch) {
      contentBn = contentMatch[2];
    }
    
    const landmarkMatch = rawBlock.match(/isLandmark:\s*(true|false)/);
    const bailableMatch = rawBlock.match(/bailable:\s*(true|false)/);
    const cognizableMatch = rawBlock.match(/cognizable:\s*(true|false)/);

    if (numMatch && titleBnMatch) {
      existingSectionsMap.set(numMatch[1], {
        id: idMatch ? idMatch[1] : `crpc-sec-${numMatch[1].toLowerCase()}`,
        sectionNumber: numMatch[1],
        sectionNumberBengali: bnNumMatch ? bnNumMatch[1] : `ধারা ${toBn(numMatch[1])}`,
        titleBengali: titleBnMatch[1],
        titleEnglish: titleEnMatch ? titleEnMatch[1] : `Section ${numMatch[1]}`,
        contentBengali: contentBn || '',
        isLandmark: landmarkMatch ? landmarkMatch[1] === 'true' : false,
        bailable: bailableMatch ? bailableMatch[1] === 'true' : undefined,
        cognizable: cognizableMatch ? cognizableMatch[1] === 'true' : undefined,
      });
    }
  }
  console.log(`Loaded ${existingSectionsMap.size} existing detailed sections from crpcFullLaw.ts`);
} catch (e) {
  console.error("Error loading existing:", e);
}

console.log("Ready to generate complete sections");
