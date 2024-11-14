import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import '../../../node_modules/codemirror/theme/darcula.css';
import './DashBoard.css';

const Code = ({ language, sockett, onCodeChange }) => {
  const editorRef = useRef();
  const [editor, setEditor] = useState(null);
  const [code, setCode] = useState('');

  const initializeCodeMirror = (config) => {
    const cm = CodeMirror(editorRef.current, config);
    setEditor(cm);
    cm.on('keyup', () => {
      const newCode = cm.getValue();
      setCode(newCode);
      onCodeChange && onCodeChange(newCode);
    });
    return cm;
  };

  const updateLanguageMode = (cm, lang) => {
    const mode = lang === 'cpp' || lang === 'c++' || lang === 'c' ? 'text/x-csrc' : lang;
    cm.setOption('mode', mode);
    cm.setOption('extraKeys', { 'Alt': 'autocomplete' });
  };

  useEffect(() => {
    const config = {
      lineNumbers: true,
      theme: 'darcula',
      autocorrect: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      indentUnit: 4,
      tabSize: 4,
      mode: language === 'cpp' || language === 'c++' || language === 'c' ? 'text/x-csrc' : language,
      hintOptions: {
        completeSingle: false,
      },
    };

    if (!editor) {
      const cm = initializeCodeMirror(config);
      updateLanguageMode(cm, language);
    } else {
      updateLanguageMode(editor, language);
    }
  }, [editor, language]);

  useEffect(() => {
    if (editor) {
      const cursor = editor.getCursor();
      sockett?.emit('Updated code for backend', { code, line: cursor.line, ch: cursor.ch });
    }
  }, [code, sockett, editor]);

  useEffect(() => {
    sockett?.on('Updated code for users', ({ codetopass, line, ch }) => {
      if (editor) {
        editor.setValue(codetopass);
        editor.setCursor({ line, ch });
      }
    });

    sockett?.on('Updated mode for users', (lang) => {
      updateLanguageMode(editor, lang);
    });

    sockett?.on('Code for new user', (code) => {
      if (editor) {
        const cursor = editor.getCursor();
        editor.setValue(code);
        editor.setCursor({ line: cursor.line, ch: cursor.ch });
      }
    });

    sockett?.on('mode for new user', (lang) => {
      updateLanguageMode(editor, lang);
    });

    return () => {
      sockett?.off('Updated code for users');
      sockett?.off('Updated mode for users');
      sockett?.off('Code for new user');
      sockett?.off('mode for new user');
    };
  }, [sockett, editor]);

  return <div ref={editorRef} style={{ width: '100%', overflowX: 'hidden' }} />;
};

export default Code;
