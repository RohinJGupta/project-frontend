"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

interface PortfolioItem {
  id?: number;
  title: string;
  description: string;
  projectCost: number;
  duration: number;
  category: string;
  projectDate: string;
  featured: boolean;
}

// Sample initial data (replace with actual API call)
const initialPortfolioItems = [
  { id: 1, title: "Electrical Repair", description: "Fixed wiring issues", projectCost: 150.0, duration: 0, category: "Electrical", projectDate: "2023-02-10", featured: false },
  { id: 2, title: "Sink Installation", description: "Installed new sink", projectCost: 200.0, duration: 0, category: "Plumbing", projectDate: "2023-03-15", featured: false },
  { id: 3, title: "Door Repair", description: "Repaired wooden door", projectCost: 100.0, duration: 0, category: "Carpentry", projectDate: "2023-04-20", featured: false },
  { id: 7, title: "Home Depot Intern", description: "Setup home network I'm a boss", projectCost: 300.0, duration: 0, category: "Networking", projectDate: "2023-02-25", featured: false }
];

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<PortfolioItem>({
    title: '',
    description: '',
    projectCost: 0,
    duration: 0,
    category: '',
    projectDate: '',
    featured: false,
  });

  // Fetch all items from the API
  const fetchPortfolioItems = async () => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data);
      } else {
        console.error('Failed to fetch items:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Handle Add Item
  const handleAddItem = async () => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newItem.title,
          description: newItem.description,
          projectCost: newItem.projectCost,
          duration: newItem.duration,
          category: newItem.category,
          projectDate: newItem.projectDate,
          featured: newItem.featured,
        }),
      });

      if (response.ok) {
        const addedItem = await response.json();
        setPortfolioItems([...portfolioItems, addedItem]);
        setIsAddDialogOpen(false);
        setNewItem({ title: '', description: '', projectCost: 0, duration: 0, category: '', projectDate: '', featured: false });
        window.location.reload();
      } else {
        console.error('Failed to add item:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/portfolio-item`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setPortfolioItems(portfolioItems.filter(item => item.id !== id));

      } else {
        const errorData = await response.json();
        console.error('Failed to delete item:', errorData);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Handle Edit Item
  const handleEditItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/portfolio-item`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedItem),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setPortfolioItems(portfolioItems.map(item => (item.id === updatedItem.id ? updatedItem : item)));
        setSelectedItem(null);
        setIsAddDialogOpen(false);

      } else {
        console.error('Failed to update item:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  // Fetch items on component mount
  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Portfolio</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2" /> Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input 
                  id="title" 
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input 
                  id="description" 
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Project Cost</Label>
                <Input 
                  id="cost" 
                  type="text"
                  value={newItem.projectCost}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewItem({...newItem, projectCost: value ? parseInt(value) : 0});
                  }}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration</Label>
                <Input 
                  id="duration" 
                  type="text"
                  value={newItem.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewItem({...newItem, duration: value ? parseInt(value) : 0});
                  }}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input 
                  id="category" 
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectDate" className="text-right">Project Date</Label>
                <Input 
                  id="projectDate" 
                  type="date"
                  value={newItem.projectDate}
                  onChange={(e) => setNewItem({...newItem, projectDate: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right">Featured</Label>
                <Input 
                  id="featured" 
                  type="checkbox"
                  checked={newItem.featured}
                  onChange={(e) => setNewItem({...newItem, featured: e.target.checked})}
                  className="col-span-3" 
                />
              </div>
              <Button onClick={handleAddItem}>Save Project</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-600">${item.projectCost.toFixed(2)}</span>
                <span className="text-sm text-gray-500">{item.projectDate}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => { setSelectedItem(item); }}>
                    <EditIcon className="mr-2" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                  </DialogHeader>
                  {selectedItem && (
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-title" className="text-right">Title</Label>
                        <Input 
                          id="edit-title" 
                          value={selectedItem.title}
                          onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})}
                          className="col-span-3" 
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-description" className="text-right">Description</Label>
                        <Input 
                          id="edit-description" 
                          value={selectedItem.description}
                          onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})}
                          className="col-span-3" 
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-category" className="text-right">Category</Label>
                        <Input 
                          id="edit-category" 
                          value={selectedItem.category}
                          onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                          className="col-span-3" 
                        />
                      </div>
                      <Button onClick={handleEditItem}>Save Changes</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDeleteItem(item.id!)}
              >
                <TrashIcon className="mr-2 h-4 w-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}