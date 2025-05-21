import { http, HttpResponse } from "msw";
import { baseUrl } from "./utils";
import { Driver } from "../../hooks/useDrivers";
import { Agent } from "../../hooks/useAgent";

let agents = [
  {
    agentId: "agent_xyz",
    userId: "user_op_101",
    firstName: "John doe",
    lastName: "User",
    email: "user@email.com",
    phoneNumber: "0789234556",
    role: "agent",
    status: "active",
    joinedDate: "2025-11-01T10:00:00Z",
  },
  {
    agentId: "agent_002",
    userId: "user_op_102",
    firstName: "John doenna",
    lastName: "Userria",
    email: "user@email.com",
    phoneNumber: "0789234556",
    role: "agent",
    status: "active",
    joinedDate: "2025-11-01T10:00:00Z",
  },
];


export const handlers = [
  // Intercept "GET /companies/{companyId}/agents" requests...
  http.get(`${baseUrl}/companies/:companyId/agents`, () => {
    // ...and respond to them using this JSON response.
      return HttpResponse.json(
        agents,
        { status: 200 }
      );
  }),
  // Intercept "GET /companies/{companyId}/agents/{busId}" requests...
  http.get(`${baseUrl}/companies/:companyId/agents/:busId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.agentId && params.companyId)
      return HttpResponse.json(
        agents.filter((agent)=> agent.agentId === params.agentId)[0],
        { status: 200 }
      );
  }),
  
  // Intercept "PUT /companies/{companyId}/agents/{agentId}" requests...
  http.put<{agentId: string;companyId: string}, Agent>(`${baseUrl}/companies/:companyId/agents/:agentId`,async ({ params, request }) => {
    // ...and respond to them using this JSON response.
    if (params.agentId && params.companyId){
      const updatedAgent = await request.json()
      const index = agents.findIndex(agent => agent.agentId === params.agentId);
      if (index !== -1) {
        agents[index] = {
          ...agents[index],
          ...updatedAgent, // Merge old + new to be safe
        };
        return HttpResponse.json(
          agents[index],
            { status: 200 }
          );
      } else {
        return HttpResponse.json(agents[index], {status: 404});
      } 
      
    }
    return HttpResponse.json({ message: "Invalid request" }, { status: 400 });
  }), 

  // Intercept "DELETE /companies/{companyId}/agents/{agentId}" requests...
  http.delete(`${baseUrl}/companies/:companyId/agents/:agentId`, ({ params }) => {
    // ...and respond to them using this JSON response.
    if (params.agentId && params.companyId){
      agents = agents.filter((agent)=> agent.agentId !== params.agentId)
      return HttpResponse.json(
        agents,
        { status: 204 }
      );
    }

  }),
  // Intercept "POST /companies/{companyId}/buses" requests...
  http.post<never,Agent>(`${baseUrl}/companies/:companyId/agents`, async ({request}) => {
    // ...and respond to them using this JSON response.
    const newAgent = await request.json()
    const newId = crypto.randomUUID();
    newAgent.agentId = newId
    newAgent.status = 'operational'
    agents.push(newAgent)
      return HttpResponse.json(
       newAgent,
        { status: 201 }
      );
  }),
];
