
// Get Nested Object Key's Value**********************************************
// Example
// const test = { level1:{ level2:{ level3:'level3'} } };
// console.log(getNested(test, 'level1', 'level2', 'level3')); // 'level3'
// ---------------------------------------------------------------------------
/**
 *
 * @param obj Nested Object
 * @param args Object Keys keys to be passed
 */
export const getNestedKeyValue = (givenObject: any, ...args: string []) => {
  return args.reduce((nestedObject, level) => nestedObject && nestedObject[level], givenObject);
};

type ValidfileTypes = 'xlsx' | 'jpeg' | 'png' | 'docx';

/**
 *
 * @param filename Filename with extention
 */
const getExtname = (filename: string) => {
  return filename.slice((Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1);

};


/**
 *
 * @param file File with Type File
 * @param fileType File extention type ex. png | jpeg
 */
export const validateFile = (file: File, fileType: ValidfileTypes) => {
  // Allowed ext & MIME Types
  let filetExt: RegExp;
  let validMIMEType: RegExp;
  let isValid = false;

  // Switching validation types based provided argument
  switch (fileType) {
      case 'xlsx' : {
          filetExt = /xlsx/;
          validMIMEType = /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/;
          break;
      }
  }

  // Check ext
  const extname = filetExt.test(getExtname(file.name).toLowerCase());

  // Check mime
  const mimetype = validMIMEType.test(file.type);

  // If both validation pass then pass the request else send error to client
  if (mimetype && extname) {
    isValid = true;
  } else {
    isValid = false;
  }

  return isValid;
};
// ***************************************************************************

// Default Auto Save Interval
export const autoSaveInterval = {
    minutes: 5,
    milliseconds() {
      return this.minutes * 60000;
    }
};

/**
 *[US29502]: [Unfinished] Project: Mandatory fields should not treat a space character as a value
 * @param input String 
 */
export const isBlankString = (str: string) => { 
  return (!str || /^\s*$/.test(str));
};