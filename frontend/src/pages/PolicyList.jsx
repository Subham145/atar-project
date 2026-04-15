import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { downloadInsuranceExcel } from "@/lib/insuranceExcel";
import { Download, Search, Trash2, AlertCircle } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * @typedef {{
 *   _id?: string,
 *   id?: string,
 *   customer_name?: string,
 *   registration_number?: string,
 *   policy_number?: string,
 *   insurance_company_name?: string,
 *   lob?: string,
 *   location?: string,
 *   vehicle_make?: string,
 *   vehicle_model?: string,
 *   total_premium?: string | number,
 *   revenue?: string | number,
 *   payment_status?: string
 * }} InsurancePolicy
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api";

export default function PolicyList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterLOB, setFilterLOB] = useState("all");
  const [selectedPolicies, setSelectedPolicies] = useState(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Single delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (policyId) => {
      const response = await fetch(`${API_BASE}/policies/${policyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete policy");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });
      setSelectedPolicies(new Set());
      setShowDeleteDialog(false);
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

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await fetch(`${API_BASE}/policies/delete-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error("Failed to delete policies");
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `${variables.length} polic${variables.length > 1 ? "ies" : "y"} deleted.`,
      });
      setSelectedPolicies(new Set());
      setShowDeleteDialog(false);
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

  /** @type {{ data?: InsurancePolicy[], isLoading: boolean }} */
  const { data: policies = [], isLoading, error } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/policies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch policies");
      return response.json();
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

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPolicies(
        new Set(filteredPolicies.map((p) => p._id || p.id))
      );
    } else {
      setSelectedPolicies(new Set());
    }
  };

  const handleSelectPolicy = (policyId, checked) => {
    const newSet = new Set(selectedPolicies);
    if (checked) {
      newSet.add(policyId);
    } else {
      newSet.delete(policyId);
    }
    setSelectedPolicies(newSet);
  };

  const handleDeleteSelected = () => {
    if (selectedPolicies.size === 0) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    const idsToDelete = Array.from(selectedPolicies);
    if (idsToDelete.length === 1) {
      deleteMutation.mutate(idsToDelete[0]);
    } else {
      bulkDeleteMutation.mutate(idsToDelete);
    }
  };

  const handleDeletePolicy = (policyId) => {
    setSelectedPolicies(new Set([policyId]));
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Failed to load policies</h3>
              <p className="text-red-700 text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📋 Upload History
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base lg:text-lg">
              {filteredPolicies.length} polic{filteredPolicies.length !== 1 ? "ies" : "y"} uploaded
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {selectedPolicies.size > 0 && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedPolicies.size})
              </Button>
            )}
            <Button
              onClick={downloadExcel}
              disabled={filteredPolicies.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 hover:shadow-xl transition-all duration-300 animate-slide-up flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-full sm:min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search customer, reg, policy..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <Select value={filterCompany} onValueChange={setFilterCompany}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
            <SelectTrigger className="w-full sm:w-[150px]">
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

        {/* Table/Cards View */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-white/20 animate-slide-up hover:shadow-xl transition-all duration-300">
          {filteredPolicies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">No Policies Found</h3>
              <p className="text-slate-600 text-center max-w-md text-sm sm:text-base">
                {policies.length === 0
                  ? "You haven't uploaded any insurance policies yet. Start by uploading a PDF file from the Upload Policies section."
                  : "No policies match your current filters. Try adjusting your search criteria."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            filteredPolicies.length > 0 &&
                            selectedPolicies.size === filteredPolicies.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">S.N.</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Customer</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Company</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">LOB</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Reg No.</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Vehicle</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Policy</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Premium</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Revenue</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="font-bold text-slate-700 text-xs sm:text-sm">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy, index) => (
                      <TableRow
                        key={policy._id || policy.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          selectedPolicies.has(policy._id || policy.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedPolicies.has(policy._id || policy.id)}
                            onCheckedChange={(checked) =>
                              handleSelectPolicy(policy._id || policy.id, checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-slate-700 text-sm">{index + 1}</TableCell>
                        <TableCell className="text-sm">
                          <div className="font-semibold text-slate-800">{policy.customer_name}</div>
                          <div className="text-xs text-slate-500">{policy.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                            {policy.insurance_company_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                            {policy.lob}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-700">
                          {policy.registration_number}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium text-slate-800">{policy.vehicle_make}</div>
                          <div className="text-xs text-slate-500">{policy.vehicle_model}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-700">
                          {policy.policy_number}
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600 text-xs">
                          ₹{policy.total_premium}
                        </TableCell>
                        <TableCell className="font-bold text-indigo-600 text-xs">
                          ₹{policy.revenue}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`font-medium text-xs ${
                              policy.payment_status?.includes("PAID")
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : "bg-amber-100 text-amber-700 border border-amber-300"
                            }`}
                          >
                            {policy.payment_status?.includes("PAID") ? "✓ Paid" : "⚠ Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePolicy(policy._id || policy.id)}
                            disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-200">
                {filteredPolicies.map((policy, index) => (
                  <div
                    key={policy._id || policy.id}
                    className={`p-4 space-y-3 transition-colors ${
                      selectedPolicies.has(policy._id || policy.id)
                        ? "bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedPolicies.has(policy._id || policy.id)}
                          onCheckedChange={(checked) =>
                            handleSelectPolicy(policy._id || policy.id, checked)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            #{index + 1} {policy.customer_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{policy.location}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePolicy(policy._id || policy.id)}
                        disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-600 font-medium">Company</p>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300 mt-1">
                          {policy.insurance_company_name}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">LOB</p>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-300 mt-1">
                          {policy.lob}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Reg No.</p>
                        <p className="font-mono text-slate-700 mt-1">{policy.registration_number}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Policy</p>
                        <p className="font-mono text-slate-700 mt-1 truncate">{policy.policy_number}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Vehicle</p>
                        <p className="text-slate-700 mt-1">{policy.vehicle_make} {policy.vehicle_model}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Status</p>
                        <Badge
                          className={`mt-1 ${
                            policy.payment_status?.includes("PAID")
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-amber-100 text-amber-700 border border-amber-300"
                          }`}
                        >
                          {policy.payment_status?.includes("PAID") ? "✓ Paid" : "⚠ Pending"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Premium</p>
                        <p className="font-bold text-emerald-600 mt-1">₹{policy.total_premium}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Revenue</p>
                        <p className="font-bold text-indigo-600 mt-1">₹{policy.revenue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50 w-full max-w-xs sm:max-w-sm mx-auto">
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <AlertDialogTitle className="text-red-700">
                  Delete Policies
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-sm">
                You are about to delete{" "}
                <span className="font-bold text-red-600">{selectedPolicies.size}</span> insurance{" "}
                {selectedPolicies.size === 1 ? "policy" : "policies"}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 flex-col-reverse sm:flex-row">
              <AlertDialogCancel className="border-slate-300 mt-2 sm:mt-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isPending || bulkDeleteMutation.isPending
                  ? "Deleting..."
                  : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
