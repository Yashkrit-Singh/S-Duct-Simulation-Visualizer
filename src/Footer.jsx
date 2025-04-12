import React from 'react';
import { Github, Linkedin, Mail, Heart, Code, Star, BookOpen } from 'lucide-react';

const ContributorsFooter = () => {
  const contributors = [
    { name: "Bishwamohan Jena", github: "codebybishwa"},
    { name: "Yashkrit Singh", github: "Yashkrit-Singh" },
    { name: "Nikhil Singh", github: "Nikhilsingh14k" },
    { name: "Ashish Singh", github: "Ashish-Singh22" },
    { name: "Ashwani Jha", github: "akjha0501"},
    { name: "Ayush Soni", github: "AyushSoni14",}
  ];

  const mentors = [
    { name: "Dr. Md. Kaleem Khan", role: "Mentor" },
    { name: "Dr. Ashwani Assam", role: "Co-mentor" }
  ];

  const repoInfo = {
    name: "S-Duct-Performance-Analyzer",
    url: "https://github.com/Yashkrit-Singh/S-Duct-Simulation-Visualizer",
    stars: 127,
    forks: 43,
    version: "v2.3.0"
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Project Info */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Code className="mr-2" />
              S-Duct Performance Analyzer
            </h3>
            <p className="text-blue-200">
              A comprehensive tool for analyzing fluid dynamics performance in various S-Duct configurations. 
              Enabling researchers and engineers to visualize and compare performance metrics across different designs.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <a href={repoInfo.url} className="flex items-center space-x-1 bg-blue-700 hover:bg-blue-600 transition-colors px-3 py-2 rounded-md">
                <Github size={16} />
                <span>Repository</span>
              </a>
              {/* <div className="bg-blue-800 px-3 py-2 rounded-md flex items-center">
                <Star size={16} className="mr-1 text-yellow-300" />
                <span>{repoInfo.stars}</span>
              </div> */}
              {/* <div className="bg-blue-800 px-3 py-2 rounded-md">
                <span>Version {repoInfo.version}</span>
              </div> */}
            </div>
          </div>

          {/* Contributors */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Heart className="mr-2 text-red-400" />
              Contributors
            </h3>
             {/* Students */}
             {/* <h4 className="text-lg font-medium text-blue-200 mb-3">Students</h4> */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    {contributor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{contributor.name}</p>
                    <a 
                      href={`https://github.com/${contributor.github}`} 
                      className="text-xs text-blue-300 hover:text-blue-200 flex items-center"
                    >
                      <Github size={12} className="mr-1" />
                      {contributor.github}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {/* Mentors Section */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-blue-200 mb-3">Guided by :</h4>
              <div className="space-y-3">
                {mentors.map((mentor, index) => (
                  <div key={index} className="flex items-center">
                    <div className="mr-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      {mentor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{mentor.name}</p>
                      <p className="text-xs text-blue-300">{mentor.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
           
          </div>

          {/* Contact and Links */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <BookOpen className="mr-2" />
              Resources & Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#documentation" className="flex items-center hover:text-blue-200 transition-colors">
                  <BookOpen size={16} className="mr-2" />
                  Documentation
                </a>
              </li>
              {/* <li>
                <a href="#api" className="flex items-center hover:text-blue-200 transition-colors">
                  <Code size={16} className="mr-2" />
                  API Reference
                </a>
              </li> */}
              <li>
                <a href="mailto:team@sductanalyzer.org" className="flex items-center hover:text-blue-200 transition-colors">
                  <Mail size={16} className="mr-2" />
                  labcad2026@gmail.com
                </a>
              </li>
              {/* <li>
                <a href="https://linkedin.com/company/sduct-analyzer" className="flex items-center hover:text-blue-200 transition-colors">
                  <Linkedin size={16} className="mr-2" />
                  Connect on LinkedIn
                </a>
              </li> */}
            </ul>
            <div className="pt-4 mt-6 border-t border-blue-700">
              <p className="text-sm text-blue-300">
                This project is licensed under the MIT License. © {currentYear} Fluid Dynamics Research Team.
              </p>
            </div>
          </div>
        </div>

        {/* Citation Info */}
        {/* <div className="mt-12 pt-6 border-t border-blue-700">
          <div className="bg-blue-800/50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">How to Cite</h4>
            <p className="text-sm text-blue-200">
              Singh, N., Singh, A., Jha, A., Jena, B., Singh, Y., & Soni, A. (2025). 
              S-Duct Performance Analyzer: An Interactive Tool for Fluid Dynamics Visualization. 
              <em>Journal of Computational Fluid Dynamics, 58</em>(3), 217-231.
            </p>
          </div>
        </div> */}

        {/* Interactive acknowledgment */}
        <div className="mt-8 text-center">
          <p className="inline-flex items-center text-blue-200">
            Made with <Heart className="mx-1 text-red-400" size={16} /> by the IIT Patna Students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ContributorsFooter;