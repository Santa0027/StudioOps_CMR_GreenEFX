import React, { useState, useEffect } from 'react';
import { createFolderStructureTemplate, updateFolderStructureTemplate } from '../api/api';
import { FaSave, FaTimes } from 'react-icons/fa';

const FolderStructureTemplateForm = ({ template, onSaveSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [structureText, setStructureText] = useState(''); // Text representation of the structure
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      // Convert JSON structure back to text for editing
setStructureText(treeToLines(template.structure).join('\n'));
    } else {
      setName('');
      setDescription('');
      setStructureText('');
    }
    setErrors({});
  }, [template]);

  // Helper to convert tree-like JSON to indented lines
  const treeToLines = (tree, indent = 0) => {
    let lines = [];
    for (const node of tree) {
      lines.push(' '.repeat(indent) + node.name);
      if (node.children && node.children.length > 0) {
        lines = lines.concat(treeToLines(node.children, indent + 4));
      }
    }
    return lines;
  };

  // Helper to parse indented lines back to tree-like JSON
  const parseLinesToTree = (lines) => {
    const tree = [];
    const stack = []; // Stores [indent, node]

    lines.forEach(line => {
      if (!line.trim()) return;

      const indent = line.search(/\S|$/); // Find first non-whitespace character
      const name = line.trim();
      const node = { name, children: [] };

      while (stack.length > 0 && stack[stack.length - 1][0] >= indent) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1][1].children.push(node);
      } else {
        tree.push(node);
      }
      stack.push([indent, node]);
    });
    return tree;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Template name is required.';
    if (!structureText.trim()) newErrors.structureText = 'Folder structure is required.';
    // Attempt to parse structure to validate format
    try {
      parseLinesToTree(structureText.split('\n'));
    } catch (e) {
      newErrors.structureText = 'Invalid folder structure format. Please use indentation for hierarchy.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const parsedStructure = parseLinesToTree(structureText.split('\n'));
      const payload = {
        name,
        description,
        structure: parsedStructure,
      };

      if (template) {
        await updateFolderStructureTemplate(template.id, payload);
      } else {
        await createFolderStructureTemplate(payload);
      }
      onSaveSuccess();
    } catch (err) {
      console.error('Error saving template:', err);
      setErrors({ api: 'Failed to save template. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {errors.api && <div className="text-red-500 text-sm mb-4">{errors.api}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          disabled={isSubmitting}
        ></textarea>
      </div>

      <div>
        <label htmlFor="structure" className="block text-sm font-medium text-gray-700">Folder Structure (Indented Text)</label>
        <textarea
          id="structure"
          value={structureText}
          onChange={(e) => setStructureText(e.target.value)}
          rows="10"
          className="mt-1 font-mono block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="e.g.
Root Folder
    Subfolder 1
        Sub-subfolder A
    Subfolder 2"
          disabled={isSubmitting}
        ></textarea>
        {errors.structureText && <p className="mt-1 text-sm text-red-600">{errors.structureText}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <FaTimes className="mr-2 mt-0.5" /> Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <FaSave className="mr-2 mt-0.5" /> {isSubmitting ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
};

export default FolderStructureTemplateForm;
