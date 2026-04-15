import React, { useState } from "react";
// ❌ REMOVE THIS
// import { base44 } from "@/api/base44Client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadInsuranceExcel } from "@/lib/insuranceExcel";
import { Download, Search, Trash2 } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = "/api"; // ✅ ADD THIS

export default function PolicyList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterLOB, setFilterLOB] = useState("all");

  // ✅ FIX DELETE
  const deleteMutation = useMutation({
    mutationFn: async (policyId) => {
      const res = await fetch(`${API_BASE}/policies/${policyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete policy");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Policy deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ✅ FIX FETCH
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/policies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch policies");
      return res.json();
    },
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.registration_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      policy.policy_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany =
      filterCompany === "all" ||
      policy.insurance_company_name === filterCompany;
    const matchesLOB = filterLOB === "all" || policy.lob === filterLOB;

    return matchesSearch && matchesCompany && matchesLOB;
  });

  const companies = [
    ...new Set(
      policies
        .map((p) => p.insurance_company_name)
        .filter((company) => typeof company === "string" && company.length > 0)
    ),
  ];

  const lobs = [
    ...new Set(
      policies
        .map((p) => p.lob)
        .filter((lob) => typeof lob === "string" && lob.length > 0)
    ),
  ];

  const downloadExcel = () => {
    downloadInsuranceExcel(
      filteredPolicies,
      `insurance_policies_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const handleDeletePolicy = (policy) => {
    const policyId = policy._id ?? policy.id;
    if (!policyId) return;
    deleteMutation.mutate(policyId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload History</h1>
          <p className="text-gray-600 mt-1">
            {filteredPolicies.length} policies uploaded
          </p>
        </div>

        <Button onClick={downloadExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterLOB} onValueChange={setFilterLOB}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by LOB" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LOB</SelectItem>
            {lobs.map((lob) => (
              <SelectItem key={lob} value={lob}>
                {lob}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>S.N.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPolicies.map((policy, index) => (
                <TableRow key={policy._id || policy.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{policy.customer_name}</TableCell>
                  <TableCell>{policy.policy_number}</TableCell>
                  <TableCell>₹{policy.total_premium}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePolicy(policy)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </div>
      </div>
    </div>
  );
}