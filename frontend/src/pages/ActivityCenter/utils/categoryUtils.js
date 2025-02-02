import { categories } from '../../Categories/Categories.js';

// Get category name from categoryId using the categories data
export const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : 'Unknown Category';
};

// Get subcategory names for a test
export const getSubcategoryNames = (test) => {
    // Early return if no test data
    if (!test) return 'All subcategories';

    // Get subcategories from the test data
    const subcategories = test.selectedSubcategories;
    
    // If no subcategories found, return default text
    if (!subcategories?.length) {
        return 'All subcategories';
    }

    // Get the category object to find subcategory names
    const category = categories.find(cat => cat.id === test.categoryId);
    if (!category?.subcategories) {
        return 'All subcategories';
    }

    // Map subcategory codes to their names
    const subcategoryNames = subcategories
        .map(subCode => {
            const subcategory = category.subcategories.find(sub => sub.code === subCode);
            return subcategory ? subcategory.name : null;
        })
        .filter(Boolean)
        .join(', ');

    return subcategoryNames || 'All subcategories';
};