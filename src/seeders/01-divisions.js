const { Division } = require('../models');

const divisions = [
  { name: 'Media Development', description: 'Handles all media-related activities' },
  { name: 'Public Relation', description: 'Manages public relations and external communications' },
  { name: 'Human Resource', description: 'Manages human resources and talent development' },
  { name: 'Project', description: 'Manages project planning and execution' },
  { name: 'Education', description: 'Handles educational programs and curriculum' },
  { name: 'Finance', description: 'Manages financial planning and operations' },
  { name: 'Executive', description: 'Executive leadership team' }
];

module.exports = async () => {
  try {
    console.log('📁 Seeding divisions...');
    
    for (const division of divisions) {
      await Division.findOrCreate({
        where: { name: division.name },
        defaults: division
      });
    }
    
    console.log('✅ Divisions seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding divisions:', error);
    throw error;
  }
};