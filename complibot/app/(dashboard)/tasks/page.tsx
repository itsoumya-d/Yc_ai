import{ListTodo}from"lucide-react";
export default function TasksPage(){
  return(
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Tasks</h1>
      <p className="mb-8" style={{color:"var(--muted-foreground)"}}>Compliance tasks and action items</p>
      <div className="text-center py-24 border rounded-2xl" style={{borderColor:"var(--border)",background:"var(--card)"}}>
        <ListTodo className="h-16 w-16 mx-auto mb-4" style={{color:"var(--muted-foreground)"}}/>
        <h3 className="text-lg font-semibold mb-2">Tasks Coming Soon</h3>
        <p className="text-sm" style={{color:"var(--muted-foreground)"}}>Task management and compliance action items will be available in the next release.</p>
      </div>
    </div>
  );
}